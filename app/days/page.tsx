import { getDays } from '@/actions/days'
import { DaysList } from '@/components/days-list'

export default async function DaysPage() {
  const days = await getDays()

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <DaysList days={days} />
    </div>
  )
}
