import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns'
import { pl } from 'date-fns/locale'

export function formatDate(d, fmt = 'yyyy-MM-dd') {
    return format(d, fmt, { locale: pl })
}

export function monthMatrix(currentDate) {
    const startMonth = startOfMonth(currentDate)
    const endMonth = endOfMonth(currentDate)
    const startDate = startOfWeek(startMonth, { weekStartsOn: 1 })
    const endDate = endOfWeek(endMonth, { weekStartsOn: 1 })

    const weeks = []
    let day = startDate
    while (day <= endDate) {
        const week = []
        for (let i = 0; i < 7; i++) {
            week.push(day)
            day = addDays(day, 1)
        }
        weeks.push(week)
    }
    return weeks
}

export { isSameMonth, isSameDay }