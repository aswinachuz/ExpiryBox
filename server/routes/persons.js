const express = require('express');
const router = express.Router();
const Person = require('../models/Person');
const Item = require('../models/Item');

// List persons
router.get('/', async (req, res) => {
  try {
    const persons = await Person.find().sort({ isPrimary: -1, createdAt: 1 });
    
    // Attach item count and status summary for each person (Family Vault feature)
    const enriched = await Promise.all(
      persons.map(async (p) => {
        const items = await Item.find({ personName: p.name, isArchived: false });
        const now = new Date();
        let expired = 0;
        let urgent = 0;
        let good = 0;

        items.forEach((item) => {
          if (item.isResolved) {
            good++;
            return;
          }
          const diff = Math.ceil((new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diff < 0) expired++;
          else if (diff <= 30) urgent++;
          else good++;
        });

        return {
          ...p.toObject(),
          totalItems: items.length,
          expiredCount: expired,
          urgentCount: urgent,
          goodCount: good,
          healthScore: items.length ? Math.max(10, 100 - (expired * 30 + urgent * 10)) : 100,
          items: items.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)),
        };
      })
    );

    res.json({ success: true, persons: enriched });
  } catch (error) {
    console.error('Error fetching persons:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add person
router.post('/', async (req, res) => {
  try {
    const { name, relation, avatar, email, phone, isPrimary } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const newPerson = new Person({
      name,
      relation: relation || 'Family Member',
      avatar: avatar || '👤',
      email,
      phone,
      isPrimary: !!isPrimary,
    });

    await newPerson.save();
    res.status(201).json({ success: true, person: newPerson });
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update person details (e.g. rename Dad / Mom, update phone/relation)
router.put('/:id', async (req, res) => {
  try {
    const { name, relation, avatar, email, phone, isPrimary } = req.body;
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res.status(404).json({ success: false, message: 'Person not found' });
    }

    const oldName = person.name;

    if (name) person.name = name.trim();
    if (relation !== undefined) person.relation = relation.trim();
    if (avatar !== undefined) person.avatar = avatar;
    if (email !== undefined) person.email = email;
    if (phone !== undefined) person.phone = phone;
    if (isPrimary !== undefined) person.isPrimary = isPrimary;

    await person.save();

    // If name changed, cascade update all linked items and assets!
    if (name && name.trim() !== oldName) {
      const newName = name.trim();
      await Item.updateMany({ personName: oldName }, { personName: newName });
      await Item.updateMany({ responsiblePerson: oldName }, { responsiblePerson: newName });
      const Asset = require('../models/Asset');
      await Asset.updateMany({ personName: oldName }, { personName: newName });
    }

    res.json({ success: true, message: 'Person updated successfully', person });
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
