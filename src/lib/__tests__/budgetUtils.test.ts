import { calculateDailyBudget } from '../budgetUtils'

// Mock expenses for testing
const mockExpenses = [
    { date: '2024-11-01', amount: -8 },  // Day 1: spent $8
    { date: '2024-11-02', amount: -5 },  // Day 2: spent $5  
    { date: '2024-11-03', amount: -15 }, // Day 3: spent $15
    { date: '2024-11-04', amount: -3 },  // Day 4: spent $3
]

describe('Budget Rollover Logic', () => {
    test('should calculate correct rollover for November 2024', () => {
        const monthlyBudget = 300
        const testDate = new Date('2024-11-04') // Day 4 of November

        const result = calculateDailyBudget(monthlyBudget, mockExpenses, testDate)

        // November has 30 days, so daily budget = $300/30 = $10
        expect(result.dailyBudget).toBe(10)
        expect(result.totalBudget).toBe(300)
        expect(result.daysInMonth).toBe(30)
        expect(result.currentDay).toBe(4)

        // Day 1: $10 budget, spent $8, rollover = $2
        // Day 2: $10 + $2 rollover = $12 budget, spent $5, rollover = $7
        // Day 3: $10 + $7 rollover = $17 budget, spent $15, rollover = $2
        // Day 4: $10 + $2 rollover = $12 budget, spent $3, rollover = $9
        expect(result.rolloverAmount).toBe(9)
        expect(result.spentToday).toBe(3) // Day 4 spending
        expect(result.spentThisMonth).toBe(31) // Total spent: 8+5+15+3 = 31
        expect(result.availableToday).toBe(9) // $12 budget - $3 spent = $9 available
        expect(result.isOverBudget).toBe(false)
    })

    test('should handle over-budget scenario', () => {
        const monthlyBudget = 300
        const overBudgetExpenses = [
            { date: '2024-11-01', amount: -15 }, // Day 1: spent $15 (over $10 budget)
            { date: '2024-11-02', amount: -20 }, // Day 2: spent $20 (over $10 budget)
        ]
        const testDate = new Date('2024-11-02')

        const result = calculateDailyBudget(monthlyBudget, overBudgetExpenses, testDate)

        expect(result.isOverBudget).toBe(true)
        expect(result.availableToday).toBe(0) // No available budget
    })

    test('should handle perfect spending scenario', () => {
        const monthlyBudget = 300
        const perfectExpenses = [
            { date: '2024-11-01', amount: -10 }, // Day 1: spent exactly $10
            { date: '2024-11-02', amount: -10 }, // Day 2: spent exactly $10
        ]
        const testDate = new Date('2024-11-02')

        const result = calculateDailyBudget(monthlyBudget, perfectExpenses, testDate)

        expect(result.rolloverAmount).toBe(0)
        expect(result.availableToday).toBe(10) // Full daily budget available
        expect(result.isOverBudget).toBe(false)
    })
})
