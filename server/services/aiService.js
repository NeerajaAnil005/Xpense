const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Builds anonymized financial summary context from user data.
 */
function buildFinancialContext(summaryStats, categoryBreakdown, budgets, recentTransactions) {
  const currentMonthExp = summaryStats.monthlyExpenses || 0;
  const currentMonthInc = summaryStats.monthlyIncome || 0;
  const totalBalance = summaryStats.totalBalance || 0;
  const netSavings = currentMonthInc - currentMonthExp;

  const categorySummary = categoryBreakdown.map(c => 
    `${c.name}: ₹${c.value.toLocaleString('en-IN')} (${c.percentage}%)`
  ).join(', ');

  const budgetSummary = budgets.map(b => 
    `${b.category}: ₹${b.spent.toLocaleString('en-IN')} spent out of ₹${b.amount.toLocaleString('en-IN')} budget (${b.percentage}% used)`
  ).join('; ');

  return `
Financial Data Summary for current month:
- Monthly Income: ₹${currentMonthInc.toLocaleString('en-IN')}
- Monthly Expenses: ₹${currentMonthExp.toLocaleString('en-IN')}
- Net Savings: ₹${netSavings.toLocaleString('en-IN')}
- Total Account Balance: ₹${totalBalance.toLocaleString('en-IN')}
- Expenses by Category: ${categorySummary || 'No expenses recorded yet'}
- Category Budgets: ${budgetSummary || 'No budgets configured yet'}
  `.trim();
}

/**
 * Fallback insight analyzer when Gemini API key is missing or fails.
 */
function generateFallbackInsights(summaryStats, categoryBreakdown, budgets) {
  const inc = summaryStats.monthlyIncome || 0;
  const exp = summaryStats.monthlyExpenses || 0;
  const net = inc - exp;
  const savingsRate = inc > 0 ? Math.round((net / inc) * 100) : 0;

  // Determine highest spending category
  const sortedCategories = [...categoryBreakdown].sort((a, b) => b.value - a.value);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

  // Find category exceeding or near budget limit
  const exceededBudget = budgets.find(b => b.percentage >= 100);
  const warningBudget = budgets.find(b => b.percentage >= 80 && b.percentage < 100);

  // Financial Health determination
  let healthStatus = 'Healthy';
  let healthReason = `You are maintaining a strong financial position with a ${savingsRate}% savings rate this month.`;

  if (exp > inc && inc > 0) {
    healthStatus = 'Needs Attention';
    healthReason = `Your monthly expenses (₹${exp.toLocaleString('en-IN')}) exceed your monthly income (₹${inc.toLocaleString('en-IN')}), resulting in negative monthly cash flow.`;
  } else if (savingsRate < 20 || exceededBudget) {
    healthStatus = 'Moderate';
    healthReason = `Your savings rate is ${savingsRate}% and some budget categories are reaching maximum utilization limits.`;
  }

  // Spending pattern
  let spendingPatternText = topCategory
    ? `${topCategory.name} is your highest spending category this month, accounting for ${topCategory.percentage}% (₹${topCategory.value.toLocaleString('en-IN')}) of your total expenses.`
    : 'You have minimal recorded expenses this month. Keep monitoring your daily transactions.';

  // Attention required
  let attentionText = 'No critical financial warnings detected.';
  if (exceededBudget) {
    attentionText = `Your ${exceededBudget.category} budget has been exceeded by ₹${(exceededBudget.spent - exceededBudget.amount).toLocaleString('en-IN')}.`;
  } else if (warningBudget) {
    attentionText = `Your ${warningBudget.category} budget is at ${warningBudget.percentage}% usage (₹${warningBudget.spent.toLocaleString('en-IN')} / ₹${warningBudget.amount.toLocaleString('en-IN')}).`;
  } else if (exp > inc && inc > 0) {
    attentionText = `Monthly expenses exceed income by ₹${(exp - inc).toLocaleString('en-IN')}. Consider lowering non-essential expenses.`;
  }

  // Budget recommendation
  let budgetRec = topCategory
    ? `Based on your recent spending, set a monthly ${topCategory.name} budget of ₹${Math.round(topCategory.value * 1.1).toLocaleString('en-IN')} to avoid overspending.`
    : 'Consider establishing monthly category budgets for Food, Bills, and Transport to build financial discipline.';

  // Saving opportunity
  let savingOpp = topCategory && topCategory.value > 2000
    ? `Reducing discretionary spending in ${topCategory.name} by 15% could save you approx. ₹${Math.round(topCategory.value * 0.15).toLocaleString('en-IN')} per month.`
    : 'Automate setting aside at least 20% of income directly into savings on payday.';

  return {
    spendingPattern: spendingPatternText,
    attentionRequired: attentionText,
    budgetRecommendation: budgetRec,
    savingOpportunity: savingOpp,
    financialHealth: {
      status: healthStatus,
      reason: healthReason
    },
    monthlyReport: {
      incomeSummary: `Total income recorded: ₹${inc.toLocaleString('en-IN')}`,
      expenseSummary: `Total expenses recorded: ₹${exp.toLocaleString('en-IN')}`,
      savingsSummary: `Net savings: ₹${net.toLocaleString('en-IN')} (${savingsRate}% savings rate)`,
      topCategories: sortedCategories.slice(0, 3).map(c => `${c.name} (₹${c.value.toLocaleString('en-IN')})`),
      unusualSpending: attentionText,
      budgetPerformance: budgets.length > 0 
        ? `${budgets.filter(b => b.percentage <= 100).length} of ${budgets.length} budgets are within limits.` 
        : 'No budgets created yet.',
      recommendations: [
        budgetRec,
        savingOpp,
        'Maintain emergency fund covering 3-6 months of essential living costs.'
      ],
      overallObservation: healthReason
    }
  };
}

/**
 * Main AI insights generator calling Gemini or falling back gracefully.
 */
async function generateAIInsights(summaryStats, categoryBreakdown, budgets, recentTransactions) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.log('Gemini API key not configured. Using rule-based financial analysis engine.');
    return generateFallbackInsights(summaryStats, categoryBreakdown, budgets);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const contextText = buildFinancialContext(summaryStats, categoryBreakdown, budgets, recentTransactions);

    const prompt = `
You are a senior financial advisor AI for an Expense Management App.
Analyze the user's financial summary below and produce actionable financial insights in JSON format.

User Financial Summary:
${contextText}

OUTPUT RULES:
Provide ONLY valid, raw JSON (no markdown formatting, no \`\`\`json block).
The JSON object MUST follow this exact schema:

{
  "spendingPattern": "String describing key spending habits",
  "attentionRequired": "String pointing out unusual, high, or exceeded budget areas",
  "budgetRecommendation": "String giving specific numeric budget advice",
  "savingOpportunity": "String suggesting actionable savings tips with monetary estimates",
  "financialHealth": {
    "status": "Healthy" | "Moderate" | "Needs Attention",
    "reason": "String explaining the financial health status"
  },
  "monthlyReport": {
    "incomeSummary": "String summarizing income",
    "expenseSummary": "String summarizing expenses",
    "savingsSummary": "String summarizing savings",
    "topCategories": ["Array of top spending category strings"],
    "unusualSpending": "String identifying potential anomalies",
    "budgetPerformance": "String summarizing budget adherence",
    "recommendations": ["Array of 3 clear recommendation strings"],
    "overallObservation": "String summarizing overall financial observation"
  }
}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Clean codeblock formatting if Gemini includes it
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);
    return parsedData;

  } catch (error) {
    console.error('Gemini API execution error:', error.message);
    return generateFallbackInsights(summaryStats, categoryBreakdown, budgets);
  }
}

module.exports = {
  generateAIInsights
};
