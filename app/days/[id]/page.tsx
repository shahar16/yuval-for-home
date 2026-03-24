import { notFound } from 'next/navigation'
import { getDay } from '@/actions/days'
import { getVisits } from '@/actions/visits'
import { getProducts } from '@/actions/products'
import { VisitsTable } from '@/components/visits-table'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DayPage({ params }: { params: { id: string } }) {
  try {
    const [day, visits, products] = await Promise.all([
      getDay(params.id),
      getVisits(params.id),
      getProducts(),
    ])

    return (
      <div className="container mx-auto py-8 space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/days">
              <Button variant="outline" size="sm">← חזרה</Button>
            </Link>
            <h1 className="text-3xl font-bold mt-4">
              {day.area} - {formatDate(day.date)}
            </h1>
          </div>
          <Button variant="outline">ייצא לאקסל</Button>
        </div>

        <VisitsTable
          visits={visits}
          products={products}
          visitDayId={params.id}
        />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
