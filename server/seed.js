const mongoose = require('mongoose');
const Person = require('./models/Person');
const Asset = require('./models/Asset');
const Item = require('./models/Item');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expirybox';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected! Clearing existing collections...');

    await Person.deleteMany({});
    await Asset.deleteMany({});
    await Item.deleteMany({});

    console.log('Seeding Family Members (PERSON tier)...');
    const aswin = await Person.create({
      name: 'Aswin',
      relation: 'Self',
      avatar: '👦',
      isPrimary: true,
      email: 'aswin@example.com',
      phone: '+91 98470 12345',
    });

    const dad = await Person.create({
      name: 'Dad',
      relation: 'Father',
      avatar: '👨',
      isPrimary: false,
      phone: '+91 94470 54321',
    });

    const mom = await Person.create({
      name: 'Mom',
      relation: 'Mother',
      avatar: '👩',
      isPrimary: false,
      phone: '+91 94470 67890',
    });

    console.log('Seeding Assets (ASSET tier)...');
    const activa = await Asset.create({
      name: 'Honda Activa 6G',
      type: 'Vehicle',
      identifier: 'KL-07-CD-4592',
      person: aswin._id,
      personName: aswin.name,
      metadata: {
        brand: 'Honda',
        model: 'Activa 6G Deluxe',
        odometerKm: 24500,
        purchaseDate: new Date('2023-04-10'),
      },
    });

    const laptop = await Asset.create({
      name: 'ASUS ExpertBook P3',
      type: 'Electronics',
      identifier: 'SN88492019-IN',
      person: aswin._id,
      personName: aswin.name,
      metadata: {
        brand: 'ASUS',
        model: 'P3540FA 16GB',
        purchaseDate: new Date('2025-10-10'),
      },
    });

    const acUnit = await Asset.create({
      name: 'LG Dual Inverter AC (Living Room)',
      type: 'Home Appliance',
      identifier: 'LG-INV-2025-X4',
      person: aswin._id,
      personName: aswin.name,
      metadata: {
        brand: 'LG',
        model: '1.5 Ton 5 Star',
        technicianContact: '9846011223 (LG Care)',
        purchaseDate: new Date('2025-03-15'),
      },
    });

    const sbiDeposit = await Asset.create({
      name: 'SBI Fixed Deposit 3Y',
      type: 'Banking & Finance',
      identifier: 'SBI-FD-983019284',
      person: aswin._id,
      personName: aswin.name,
      metadata: {
        brand: 'State Bank of India',
        notes: 'Interest 7.10% p.a., Auto-credit to savings account',
      },
    });

    console.log('Seeding Tracked Items & Deadlines with History, Checklists, & Delegation...');
    const now = new Date();

    const addDays = (days) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d;
    };

    const itemsData = [
      {
        title: 'Honda Activa Comprehensive Insurance',
        category: 'vehicle',
        priority: 'critical',
        privacy: 'family',
        person: aswin._id,
        personName: aswin.name,
        responsiblePerson: 'Aswin',
        asset: activa._id,
        assetName: activa.name,
        documentNumber: 'POL-HDFC-9920194',
        documentType: 'Vehicle Insurance',
        provider: 'HDFC ERGO',
        expiryDate: addDays(7), // 7 days -> CRITICAL
        gracePeriodDays: 15,
        amount: 2450,
        currency: 'INR',
        billingCycle: 'annual',
        notes: 'Includes zero depreciation, engine protect, and 24x7 roadside assistance.',
        tags: ['vehicle', 'insurance', 'urgent', 'bike'],
        checklist: [
          { task: 'Verify existing insurance policy copy & NCB certificate', isCompleted: true },
          { task: 'Check PUC pollution certificate validity', isCompleted: false },
          { task: 'Note current odometer reading (24,500 km)', isCompleted: true },
          { task: 'Compare renewal quotes online (PolicyBazaar / HDFC ERGO)', isCompleted: false, link: 'https://www.hdfcergo.com' },
        ],
        renewalHistory: [
          {
            renewalDate: new Date('2025-10-22'),
            previousExpiryDate: new Date('2025-10-22'),
            newExpiryDate: addDays(7),
            amountPaid: 2320,
            provider: 'HDFC ERGO',
            notes: 'Renewed via NetBanking with 20% No-Claim Bonus discount.',
            attachments: [
              {
                filename: 'previous_policy_2025.pdf',
                originalname: 'HDFC_Policy_2024_2025.pdf',
                mimetype: 'application/pdf',
                path: '/uploads/sample_policy.pdf',
                size: 245000,
              },
            ],
          },
        ],
        activityLog: [
          { action: 'created', details: 'Record initialized from physical policy schedule', performedBy: 'Aswin' },
          { action: 'renewed', details: 'Renewed for policy period 2025-2026', performedBy: 'Aswin' },
        ],
      },
      {
        title: 'ASUS ExpertBook Hardware Warranty',
        category: 'warranty',
        priority: 'high',
        privacy: 'family',
        person: aswin._id,
        personName: aswin.name,
        responsiblePerson: 'Aswin',
        asset: laptop._id,
        assetName: laptop.name,
        documentNumber: 'WAR-ASUS-8849',
        documentType: 'Warranty Card',
        provider: 'ASUS India Care',
        expiryDate: addDays(28), // 28 days -> URGENT
        amount: 0,
        currency: 'INR',
        notes: '1-year on-site accidental damage protection included.',
        tags: ['electronics', 'laptop', 'warranty', 'asus'],
        checklist: [
          { task: 'Locate original purchase invoice (Amazon India)', isCompleted: true },
          { task: 'Run MyASUS hardware diagnostic test', isCompleted: false },
          { task: 'Check warranty extension pricing on ASUS portal', isCompleted: false, link: 'https://www.asus.com/in' },
        ],
        activityLog: [
          { action: 'created', details: 'Warranty registered upon unboxing', performedBy: 'Aswin' },
        ],
      },
      {
        title: 'Pollution Under Control (PUC)',
        category: 'vehicle',
        priority: 'normal',
        privacy: 'family',
        person: aswin._id,
        personName: aswin.name,
        responsiblePerson: 'Aswin',
        asset: activa._id,
        assetName: activa.name,
        documentNumber: 'PUC-KL07-2026-88',
        documentType: 'PUC Certificate',
        provider: 'Kerala MVD Authorized Center',
        expiryDate: addDays(45), // 45 days -> GOOD
        amount: 110,
        currency: 'INR',
        billingCycle: 'half-yearly',
        notes: 'Tested at Vyttila Fuel Station center. CO level 0.12%.',
        tags: ['vehicle', 'puc', 'mvd', 'bike'],
        checklist: [
          { task: 'Take scooter to emission testing station', isCompleted: true },
          { task: 'Verify status update on Parivahan online portal', isCompleted: true, link: 'https://vahan.parivahan.gov.in/puc' },
        ],
      },
      {
        title: 'SBI Fixed Deposit Maturity',
        category: 'finance',
        priority: 'normal',
        privacy: 'private',
        person: aswin._id,
        personName: aswin.name,
        responsiblePerson: 'Aswin',
        asset: sbiDeposit._id,
        assetName: sbiDeposit.name,
        documentNumber: 'SBI-FD-983019284',
        documentType: 'Fixed Deposit Receipt',
        provider: 'State Bank of India',
        expiryDate: addDays(63), // 63 days -> GOOD
        amount: 200000,
        currency: 'INR',
        notes: 'Principal: ₹2,00,000. Maturity value: ₹2,46,800. Renew or transfer to liquid fund upon maturity.',
        tags: ['finance', 'fd', 'sbi', 'investment'],
        checklist: [
          { task: 'Check maturity proceeds destination savings account', isCompleted: true },
          { task: 'Submit Form 15G to avoid TDS on interest income', isCompleted: false, link: 'https://www.onlinesbi.sbi' },
        ],
      },
      {
        title: 'Netflix Premium 4K Subscription',
        category: 'subscription',
        priority: 'normal',
        privacy: 'family',
        person: aswin._id,
        personName: aswin.name,
        responsiblePerson: 'Aswin',
        documentNumber: 'SUB-NETFLIX-99',
        documentType: 'Subscription Renewal',
        provider: 'Netflix India',
        expiryDate: addDays(10), // 10 days -> URGENT
        isRecurring: true,
        recurrenceInterval: 'monthly',
        amount: 649,
        currency: 'INR',
        billingCycle: 'monthly',
        notes: 'Auto-debit on HDFC Millennia Credit Card.',
        tags: ['subscription', 'entertainment', 'monthly'],
      },
      {
        title: 'LG Dual Inverter AC Winter Service',
        category: 'home',
        priority: 'high',
        privacy: 'family',
        person: aswin._id,
        personName: aswin.name,
        responsiblePerson: 'Dad',
        asset: acUnit._id,
        assetName: acUnit.name,
        documentNumber: 'SRV-LG-4402',
        documentType: 'Service Due Reminder',
        provider: 'LG Authorized Service',
        expiryDate: addDays(18), // 18 days -> URGENT
        amount: 590,
        currency: 'INR',
        notes: 'Filter deep clean, coil wash, and gas pressure check.',
        tags: ['home', 'ac', 'service'],
        checklist: [
          { task: 'Call LG Care technician (9846011223)', isCompleted: false },
          { task: 'Inspect outdoor condenser drainage pipe', isCompleted: true },
        ],
      },
      {
        title: "Dad's Driving Licence Renewal",
        category: 'document',
        priority: 'critical',
        privacy: 'family',
        person: dad._id,
        personName: dad.name,
        responsiblePerson: 'Dad',
        documentNumber: 'DL-0720020084920',
        documentType: 'Driving Licence',
        provider: 'Kerala MVD (Ernakulam)',
        expiryDate: addDays(-10), // -10 days -> EXPIRED
        amount: 450,
        currency: 'INR',
        notes: 'Requires eye test certificate (Form 1A) and Sarathi online application.',
        tags: ['document', 'mvd', 'licence', 'expired'],
        checklist: [
          { task: 'Obtain Medical Fitness Certificate Form 1A from registered doctor', isCompleted: false },
          { task: 'Keep original Aadhaar card & physical licence handy', isCompleted: true },
          { task: 'Submit Sarathi online application & fee payment', isCompleted: false, link: 'https://sarathi.parivahan.gov.in' },
        ],
        activityLog: [
          { action: 'created', details: 'Added to family vault', performedBy: 'Aswin' },
        ],
      },
      {
        title: "Dad's Maruti Brezza Insurance",
        category: 'vehicle',
        priority: 'high',
        privacy: 'family',
        person: dad._id,
        personName: dad.name,
        responsiblePerson: 'Dad',
        documentNumber: 'POL-NEWINDIA-8849',
        documentType: 'Vehicle Insurance',
        provider: 'New India Assurance',
        expiryDate: addDays(40), // 40 days -> SOON
        amount: 8900,
        currency: 'INR',
        billingCycle: 'annual',
        notes: 'Comprehensive cover with engine protect and zero depreciation.',
        tags: ['vehicle', 'insurance', 'car'],
      },
      {
        title: "Dad's Republic of India Passport",
        category: 'document',
        priority: 'normal',
        privacy: 'family',
        person: dad._id,
        personName: dad.name,
        responsiblePerson: 'Dad',
        documentNumber: 'K-9920194',
        documentType: 'Passport',
        provider: 'Passport Seva Kendra Cochin',
        expiryDate: addDays(1825), // 5 years -> VALID / SAFE
        notes: '60-page jumbo booklet. Valid international travel document.',
        tags: ['document', 'passport', 'id'],
      },
      {
        title: "Mom's Star Health Comprehensive Insurance",
        category: 'health',
        priority: 'high',
        privacy: 'family',
        person: mom._id,
        personName: mom.name,
        responsiblePerson: 'Dad',
        documentNumber: 'STAR-HLTH-773019',
        documentType: 'Health Insurance Policy',
        provider: 'Star Health & Allied Insurance',
        expiryDate: addDays(52), // 52 days -> GOOD
        gracePeriodDays: 30,
        amount: 16800,
        currency: 'INR',
        billingCycle: 'annual',
        notes: 'Sum insured: ₹10,00,000. Cashless network valid across all major hospitals.',
        tags: ['health', 'insurance', 'family'],
        checklist: [
          { task: 'Confirm zero claims submitted in past 12 months for 10% bonus', isCompleted: true },
          { task: 'Pay renewal premium on Star Health portal before grace period ends', isCompleted: false, link: 'https://www.starhealth.in' },
        ],
        renewalHistory: [
          {
            renewalDate: new Date('2025-12-06'),
            previousExpiryDate: new Date('2025-12-06'),
            newExpiryDate: addDays(52),
            amountPaid: 15400,
            provider: 'Star Health',
            notes: 'Paid online via Debit Card with cumulative bonus credit.',
          },
        ],
      },
      {
        title: "Aswin's Republic of India Passport",
        category: 'document',
        priority: 'normal',
        privacy: 'family',
        person: aswin._id,
        personName: aswin.name,
        responsiblePerson: 'Aswin',
        documentNumber: 'Z-8492019',
        documentType: 'Passport',
        provider: 'Passport Seva Kendra Cochin',
        expiryDate: addDays(730), // 2 years -> GOOD
        notes: '36-page regular booklet. Valid for international travel.',
        tags: ['document', 'passport', 'id'],
        checklist: [
          { task: 'Verify minimum 6 months validity for international transit', isCompleted: true },
        ],
      },
    ];

    await Item.create(itemsData);
    console.log(`Successfully seeded ${itemsData.length} enriched items!`);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
