export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined || isNaN(amount)) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return 0;
  const now = new Date();
  const diffTime = new Date(expiryDate).getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStatusMeta = (daysRemaining, isResolved = false) => {
  if (isResolved) {
    return {
      type: 'resolved',
      label: 'Renewed / Done',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-600',
      pillText: '🟢 Resolved',
    };
  }
  if (daysRemaining < 0) {
    const absDays = Math.abs(daysRemaining);
    return {
      type: 'expired',
      label: `Expired ${absDays}d ago`,
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      dotClass: 'bg-rose-600',
      pillText: `🔴 Expired ${absDays}d ago`,
    };
  }
  if (daysRemaining <= 7) {
    return {
      type: 'critical',
      label: daysRemaining === 0 ? 'Expires today' : `${daysRemaining} days left`,
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
      dotClass: 'bg-orange-600',
      pillText: `🔴 ${daysRemaining} days left`,
    };
  }
  if (daysRemaining <= 30) {
    return {
      type: 'urgent',
      label: `${daysRemaining} days left`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-500',
      pillText: `🟡 ${daysRemaining} days left`,
    };
  }
  return {
    type: 'good',
    label: `${daysRemaining} days left`,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
    pillText: `🟢 ${daysRemaining} days left`,
  };
};

export const CATEGORY_META = {
  document: {
    label: 'Document',
    emoji: '📄',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  vehicle: {
    label: 'Vehicle',
    emoji: '🚗',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  warranty: {
    label: 'Warranty',
    emoji: '🧾',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  subscription: {
    label: 'Subscription',
    emoji: '💳',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  finance: {
    label: 'Finance / Investment',
    emoji: '🏦',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  home: {
    label: 'Home & Property',
    emoji: '🏠',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  health: {
    label: 'Health & Medical',
    emoji: '🩺',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  other: {
    label: 'Other Reminder',
    emoji: '📌',
    color: 'bg-stone-50 text-stone-700 border-stone-200',
  },
};
