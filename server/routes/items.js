const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Person = require('../models/Person');
const Asset = require('../models/Asset');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Category default checklists with official guidance links
const DEFAULT_CHECKLISTS = {
  vehicle: [
    { task: 'Verify existing insurance policy copy & claim history', isCompleted: true },
    { task: 'Check PUC pollution certificate validity', isCompleted: false },
    { task: 'Note current odometer reading & inspect tyre wear', isCompleted: false },
    { task: 'Compare renewal quotes online (PolicyBazaar / HDFC ERGO)', isCompleted: false, link: 'https://www.hdfcergo.com' },
  ],
  document: [
    { task: 'Obtain Medical Fitness Certificate Form 1A (if DL renewal)', isCompleted: false },
    { task: 'Keep original Aadhaar card & physical licence handy', isCompleted: true },
    { task: 'Submit Sarathi online application & fee payment', isCompleted: false, link: 'https://sarathi.parivahan.gov.in' },
  ],
  warranty: [
    { task: 'Locate original tax invoice & warranty booklet', isCompleted: true },
    { task: 'Note product serial number and model label', isCompleted: true },
    { task: 'Schedule authorized technician diagnostics before warranty ends', isCompleted: false },
  ],
  health: [
    { task: 'Check annual health checkup voucher eligibility', isCompleted: false },
    { task: 'Review cumulative no-claim bonus (NCB)', isCompleted: true },
    { task: 'Pay renewal premium before 30-day grace period expires', isCompleted: false, link: 'https://www.starhealth.in' },
  ],
  subscription: [
    { task: 'Review actual viewing/usage frequency', isCompleted: false },
    { task: 'Check card auto-debit limit on banking app', isCompleted: true },
  ],
  finance: [
    { task: 'Check maturity proceeds destination savings account', isCompleted: true },
    { task: 'Compare prevailing fixed deposit interest rates', isCompleted: false },
  ],
};

// 1. STATS: Overview metrics for Dashboard
router.get('/stats', async (req, res) => {
  try {
    const items = await Item.find({ isArchived: false });
    const now = new Date();

    let expiredCount = 0;
    let criticalCount = 0; // <= 7 days
    let urgentCount = 0;   // <= 30 days
    let goodCount = 0;     // > 30 days
    let snoozedCount = 0;
    const categoryCounts = {};
    const priorityCounts = { critical: 0, high: 0, normal: 0, low: 0 };

    items.forEach((item) => {
      // Category aggregation
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      priorityCounts[item.priority || 'normal'] = (priorityCounts[item.priority || 'normal'] || 0) + 1;

      if (item.isResolved) {
        goodCount++;
        return;
      }

      if (item.snoozedUntil && new Date(item.snoozedUntil) > now) {
        snoozedCount++;
        return;
      }

      const diffTime = new Date(item.expiryDate).getTime() - now.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days < 0) {
        expiredCount++;
      } else if (days <= 7) {
        criticalCount++;
        urgentCount++;
      } else if (days <= 30) {
        urgentCount++;
      } else {
        goodCount++;
      }
    });

    const totalTracked = items.length;
    // Balanced Health Score: Active items give 100%, Soon (moderate) give 75%, Critical give 35%, Expired give 0%
    let healthScore = 100;
    if (totalTracked > 0) {
      const moderateUrgent = Math.max(0, urgentCount - criticalCount);
      const points = (goodCount * 100) + (moderateUrgent * 75) + (criticalCount * 35) + (snoozedCount * 60) + (expiredCount * 0);
      healthScore = Math.max(15, Math.min(100, Math.round(points / totalTracked)));
    }

    // Top items needing immediate attention (Priority weighted + expiry date)
    const priorityWeights = { critical: 4, high: 3, normal: 2, low: 1 };
    const needsAttention = items
      .filter((i) => !i.isResolved)
      .sort((a, b) => {
        const diffP = (priorityWeights[b.priority || 'normal'] || 2) - (priorityWeights[a.priority || 'normal'] || 2);
        if (diffP !== 0) return diffP;
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      })
      .slice(0, 6);

    res.json({
      success: true,
      totalTracked,
      expiredCount,
      soonCount: urgentCount,
      activeCount: goodCount,
      criticalCount,
      snoozedCount,
      healthScore,
      categoryCounts,
      priorityCounts,
      needsAttention,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. TIMELINE: Grouped life timeline view
router.get('/timeline', async (req, res) => {
  try {
    const items = await Item.find({ isArchived: false, isResolved: false })
      .sort({ expiryDate: 1 });

    const now = new Date();
    const groups = {
      expired: [],
      next7Days: [],
      next30Days: [],
      next90Days: [],
      later: [],
      snoozed: [],
    };

    items.forEach((item) => {
      if (item.snoozedUntil && new Date(item.snoozedUntil) > now) {
        groups.snoozed.push(item);
        return;
      }

      const diffTime = new Date(item.expiryDate).getTime() - now.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days < 0) {
        groups.expired.push(item);
      } else if (days <= 7) {
        groups.next7Days.push(item);
      } else if (days <= 30) {
        groups.next30Days.push(item);
      } else if (days <= 90) {
        groups.next90Days.push(item);
      } else {
        groups.later.push(item);
      }
    });

    res.json({ success: true, timeline: groups });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. MISSED REMINDERS RECOVERY: Alerts that passed while away
router.get('/missed-reminders', async (req, res) => {
  try {
    const now = new Date();
    // Find uncompleted items that are either expired or due within 7 days
    const items = await Item.find({
      isArchived: false,
      isResolved: false,
      expiryDate: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    }).sort({ expiryDate: 1 });

    const missed = items.map((item) => {
      const days = Math.ceil((new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        _id: item._id,
        title: item.title,
        category: item.category,
        priority: item.priority || 'normal',
        personName: item.personName,
        assetName: item.assetName,
        expiryDate: item.expiryDate,
        daysRemaining: days,
        isOverdue: days < 0,
        provider: item.provider,
        amount: item.amount,
      };
    });

    res.json({ success: true, count: missed.length, missed });
  } catch (error) {
    console.error('Error fetching missed reminders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. CALENDAR: Items with events in a specific month & year
router.get('/calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const items = await Item.find({
      isArchived: false,
      expiryDate: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ expiryDate: 1 });

    res.json({
      success: true,
      month: targetMonth + 1,
      year: targetYear,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. UNIVERSAL SMART SEARCH with synonyms
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, results: [] });
    }

    const trimmed = q.trim();
    const regex = new RegExp(trimmed, 'i');

    const synonyms = [];
    if (/bike|scooter|motorcycle|two-wheeler/i.test(trimmed)) {
      synonyms.push('vehicle', 'activa', 'honda');
    } else if (/laptop|pc|computer|macbook/i.test(trimmed)) {
      synonyms.push('electronics', 'asus', 'warranty');
    } else if (/car|four-wheeler/i.test(trimmed)) {
      synonyms.push('vehicle');
    } else if (/fd|deposit|investment/i.test(trimmed)) {
      synonyms.push('finance', 'sbi');
    }

    const orClauses = [
      { title: regex },
      { documentNumber: regex },
      { documentType: regex },
      { provider: regex },
      { assetName: regex },
      { personName: regex },
      { responsiblePerson: regex },
      { category: regex },
      { notes: regex },
      { tags: regex },
    ];

    synonyms.forEach((syn) => {
      const synRegex = new RegExp(syn, 'i');
      orClauses.push({ category: synRegex });
      orClauses.push({ assetName: synRegex });
      orClauses.push({ tags: synRegex });
    });

    const items = await Item.find({
      isArchived: false,
      $or: orClauses,
    }).sort({ expiryDate: 1 });

    res.json({ success: true, count: items.length, results: items });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. CSV EXPORT: Portable table report download
router.get('/export/csv', async (req, res) => {
  try {
    const items = await Item.find({ isArchived: false }).sort({ expiryDate: 1 });
    const now = new Date();

    const headers = [
      'Title',
      'Category',
      'Priority',
      'Owner',
      'Responsible Person',
      'Asset',
      'Provider',
      'Document No',
      'Document Type',
      'Expiry Date',
      'Days Remaining',
      'Status',
      'Amount (INR)',
      'Billing Cycle',
      'Grace Period (Days)',
      'Notes',
    ];

    const rows = items.map((item) => {
      const days = Math.ceil((new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let statusStr = item.isResolved ? 'Resolved' : days < 0 ? 'Expired' : days <= 7 ? 'Critical' : days <= 30 ? 'Urgent' : 'Active';

      const escape = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;

      return [
        escape(item.title),
        escape(item.category),
        escape(item.priority || 'normal'),
        escape(item.personName),
        escape(item.responsiblePerson || item.personName),
        escape(item.assetName),
        escape(item.provider),
        escape(item.documentNumber),
        escape(item.documentType),
        escape(new Date(item.expiryDate).toLocaleDateString('en-IN')),
        days,
        escape(statusStr),
        item.amount || '',
        escape(item.billingCycle || 'one-time'),
        item.gracePeriodDays || 0,
        escape(item.notes),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="ExpiryBox_Inventory_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. LIST ITEMS with filters
router.get('/', async (req, res) => {
  try {
    const { category, status, priority, personName, assetName, sortBy = 'expiryDate', order = 'asc' } = req.query;
    const filter = { isArchived: false };

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (personName) {
      filter.personName = personName;
    }
    if (assetName) {
      filter.assetName = assetName;
    }

    let items = await Item.find(filter)
      .populate('person')
      .populate('asset')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    if (status && status !== 'all') {
      items = items.filter((item) => item.status === status);
    }

    res.json({ success: true, count: items.length, items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. GET SINGLE ITEM
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('person')
      .populate('asset');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. CREATE ITEM
router.post('/', upload.array('attachments', 5), async (req, res) => {
  try {
    const body = req.body;
    
    let reminders;
    if (body.reminders) {
      try {
        reminders = typeof body.reminders === 'string' ? JSON.parse(body.reminders) : body.reminders;
      } catch (e) {
        reminders = undefined;
      }
    }

    let tags = [];
    if (body.tags) {
      try {
        tags = typeof body.tags === 'string' ? JSON.parse(body.tags) : body.tags;
      } catch (e) {
        tags = body.tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    const attachments = (req.files || []).map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      path: `/uploads/${file.filename}`,
      size: file.size,
    }));

    // Check if category has default checklist
    const cat = body.category || 'document';
    const initialChecklist = DEFAULT_CHECKLISTS[cat] || [];

    const newItem = new Item({
      title: body.title,
      category: cat,
      priority: body.priority || 'normal',
      privacy: body.privacy || 'family',
      personName: body.personName || 'Aswin',
      responsiblePerson: body.responsiblePerson || body.personName || 'Aswin',
      assetName: body.assetName || '',
      documentNumber: body.documentNumber || '',
      documentType: body.documentType || 'Document',
      provider: body.provider || '',
      issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
      expiryDate: new Date(body.expiryDate),
      isRecurring: body.isRecurring === 'true' || body.isRecurring === true,
      recurrenceInterval: body.recurrenceInterval || 'none',
      gracePeriodDays: body.gracePeriodDays ? Number(body.gracePeriodDays) : 0,
      amount: body.amount ? Number(body.amount) : null,
      currency: body.currency || 'INR',
      billingCycle: body.billingCycle || 'one-time',
      notes: body.notes || '',
      tags,
      attachments,
      reminders: reminders || undefined,
      checklist: initialChecklist,
      activityLog: [
        {
          action: 'created',
          details: `Item created with expiry date ${new Date(body.expiryDate).toLocaleDateString('en-IN')}`,
          performedBy: body.personName || 'Aswin',
        },
      ],
    });

    await newItem.save();
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// 10. SNOOZE ITEM
router.patch('/:id/snooze', async (req, res) => {
  try {
    const { days = 1, customDate, reason = '' } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    let targetDate;
    if (customDate) {
      targetDate = new Date(customDate);
    } else {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + Number(days));
    }

    item.snoozedUntil = targetDate;
    item.snoozeCount = (item.snoozeCount || 0) + 1;

    item.activityLog.push({
      action: 'snoozed',
      details: `Alert snoozed until ${targetDate.toLocaleDateString('en-IN')}${reason ? ` (${reason})` : ''}`,
      performedBy: 'Aswin',
    });

    await item.save();
    res.json({
      success: true,
      message: `Item snoozed until ${targetDate.toLocaleDateString('en-IN')}`,
      item,
    });
  } catch (error) {
    console.error('Error snoozing item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. CHECKLIST ITEM TOGGLE
router.patch('/:id/checklist', async (req, res) => {
  try {
    const { taskIndex, isCompleted } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item || !item.checklist[taskIndex]) {
      return res.status(404).json({ success: false, message: 'Checklist task not found' });
    }

    item.checklist[taskIndex].isCompleted = isCompleted;
    item.activityLog.push({
      action: 'checklist_updated',
      details: `Marked "${item.checklist[taskIndex].task}" as ${isCompleted ? 'completed' : 'pending'}`,
      performedBy: 'Aswin',
    });

    await item.save();
    res.json({ success: true, checklist: item.checklist, item });
  } catch (error) {
    console.error('Error updating checklist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 12. RENEW ITEM with Versioning & History Archive
router.patch('/:id/renew', upload.array('newAttachments', 5), async (req, res) => {
  try {
    const { newExpiryDate, notes, amountPaid, provider } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const previousExpiryDate = item.expiryDate;
    let nextDate;

    if (newExpiryDate) {
      nextDate = new Date(newExpiryDate);
    } else if (item.isRecurring && item.recurrenceInterval === 'monthly') {
      nextDate = new Date(previousExpiryDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (item.isRecurring && item.recurrenceInterval === 'quarterly') {
      nextDate = new Date(previousExpiryDate);
      nextDate.setMonth(nextDate.getMonth() + 3);
    } else {
      // Default: extend by 1 year from current expiry or today
      const baseDate = new Date(previousExpiryDate) > new Date() ? new Date(previousExpiryDate) : new Date();
      baseDate.setFullYear(baseDate.getFullYear() + 1);
      nextDate = baseDate;
    }

    // New uploaded attachment versions
    const newAttachments = (req.files || []).map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      path: `/uploads/${file.filename}`,
      size: file.size,
    }));

    // Archive previous version to renewalHistory
    item.renewalHistory.push({
      renewalDate: new Date(),
      previousExpiryDate: previousExpiryDate,
      newExpiryDate: nextDate,
      amountPaid: amountPaid ? Number(amountPaid) : item.amount,
      provider: provider || item.provider,
      notes: notes || 'Standard renewal',
      attachments: [...item.attachments],
    });

    // Replace or append attachments
    if (newAttachments.length > 0) {
      item.attachments.push(...newAttachments);
    }

    item.expiryDate = nextDate;
    if (provider) item.provider = provider;
    if (amountPaid) item.amount = Number(amountPaid);

    item.isResolved = false;
    item.resolvedAt = null;
    item.snoozedUntil = null;

    // Reset reminders
    item.reminders.forEach((r) => {
      r.isTriggered = false;
      r.triggeredAt = null;
    });

    // Reset checklist items to pending for next cycle
    if (item.checklist && item.checklist.length > 0) {
      item.checklist.forEach((c) => {
        c.isCompleted = false;
      });
    }

    item.activityLog.push({
      action: 'renewed',
      details: `Renewed to ${nextDate.toLocaleDateString('en-IN')}. Previous expiry was ${new Date(previousExpiryDate).toLocaleDateString('en-IN')}`,
      performedBy: 'Aswin',
    });

    await item.save();
    res.json({ success: true, message: 'Item renewed & version archived', item });
  } catch (error) {
    console.error('Error renewing item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 13. RESOLVE / COMPLETE TOGGLE
router.patch('/:id/resolve', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.isResolved = !item.isResolved;
    item.resolvedAt = item.isResolved ? new Date() : null;

    item.activityLog.push({
      action: item.isResolved ? 'resolved' : 'reopened',
      details: item.isResolved ? 'Marked as completed / resolved' : 'Reopened for tracking',
      performedBy: 'Aswin',
    });

    await item.save();
    res.json({ success: true, isResolved: item.isResolved, item });
  } catch (error) {
    console.error('Error toggling resolve:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 14. DELETE ITEM
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.attachments && item.attachments.length > 0) {
      item.attachments.forEach((file) => {
        if (file.filename) {
          const filePath = path.join(__dirname, '..', 'uploads', file.filename);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (err) {}
          }
        }
      });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 15. BACKUP EXPORT & IMPORT
router.get('/backup/export', async (req, res) => {
  try {
    const items = await Item.find({});
    const persons = await Person.find({});
    const assets = await Asset.find({});

    const exportData = {
      version: '1.5',
      exportedAt: new Date().toISOString(),
      appName: 'ExpiryBox',
      summary: {
        itemsCount: items.length,
        personsCount: persons.length,
        assetsCount: assets.length,
      },
      data: {
        persons,
        assets,
        items,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=expirybox_backup_${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting backup:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/backup/import', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data.items)) {
      return res.status(400).json({ success: false, message: 'Invalid backup file format' });
    }

    if (data.persons && data.persons.length > 0) {
      for (const p of data.persons) {
        delete p._id;
        await Person.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
      }
    }

    if (data.assets && data.assets.length > 0) {
      for (const a of data.assets) {
        delete a._id;
        await Asset.findOneAndUpdate({ name: a.name }, a, { upsert: true, new: true });
      }
    }

    let importedCount = 0;
    for (const itemData of data.items) {
      delete itemData._id;
      delete itemData.id;
      const newItem = new Item(itemData);
      await newItem.save();
      importedCount++;
    }

    res.json({ success: true, message: `Successfully restored ${importedCount} records.` });
  } catch (error) {
    console.error('Error importing backup:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
