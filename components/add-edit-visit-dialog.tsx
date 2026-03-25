'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Product, VisitWithProducts } from '@/lib/types'
import { createVisit, updateVisit, CreateVisitInput } from '@/actions/visits'
import { calculateTotalPrice, formatPrice, validateIsraeliPhone } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const visitSchema = z.object({
  name: z.string().min(1, 'שדה חובה'),
  phone: z.string().refine(validateIsraeliPhone, 'מספר טלפון לא תקין'),
  address: z.string().min(1, 'שדה חובה'),
  floor: z.string().min(1, 'שדה חובה'),
  apartment: z.string().min(1, 'שדה חובה'),
  building_code: z.string().min(1, 'שדה חובה'),
  payment_method: z.enum(['cash', 'bit']),
  is_paid: z.boolean(),
  product_ids: z.array(z.string()).min(1, 'יש לבחור לפחות מוצר אחד'),
})

type VisitFormData = z.infer<typeof visitSchema>

interface AddEditVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitDayId: string
  products: Product[]
  visit?: VisitWithProducts
}

export function AddEditVisitDialog({
  open,
  onOpenChange,
  visitDayId,
  products,
  visit,
}: AddEditVisitDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      floor: '',
      apartment: '',
      building_code: '',
      payment_method: 'cash',
      is_paid: false,
      product_ids: [],
    },
  })

  useEffect(() => {
    if (visit) {
      reset({
        name: visit.name,
        phone: visit.phone,
        address: visit.address,
        floor: visit.floor,
        apartment: visit.apartment,
        building_code: visit.building_code,
        payment_method: visit.payment_method,
        is_paid: visit.is_paid,
        product_ids: visit.products.map(p => p.id),
      })
      setSelectedProducts(visit.products.map(p => p.id))
    }
  }, [visit, reset])

  const toggleProduct = (productId: string) => {
    const newSelected = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId]

    setSelectedProducts(newSelected)
    setValue('product_ids', newSelected, { shouldValidate: true })
  }

  const totalPrice = calculateTotalPrice(selectedProducts.length)

  const onSubmit = async (data: VisitFormData) => {
    setIsLoading(true)

    try {
      const input: CreateVisitInput = {
        ...data,
        visit_day_id: visitDayId,
      }

      if (visit) {
        await updateVisit(visit.id, input)
      } else {
        await createVisit(input)
      }

      onOpenChange(false)
      reset()
      setSelectedProducts([])
    } catch (error: any) {
      alert(error.message || 'שגיאה בשמירת ביקור')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{visit ? 'עריכת ביקור' : 'הוספת ביקור חדש'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">טלפון *</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">כתובת *</Label>
            <Input id="address" {...register('address')} />
            {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">קומה *</Label>
              <Input id="floor" {...register('floor')} />
              {errors.floor && <p className="text-sm text-red-600">{errors.floor.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apartment">דירה *</Label>
              <Input id="apartment" {...register('apartment')} />
              {errors.apartment && <p className="text-sm text-red-600">{errors.apartment.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="building_code">קוד בניין *</Label>
            <Input id="building_code" {...register('building_code')} />
            {errors.building_code && <p className="text-sm text-red-600">{errors.building_code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>מוצרים * ({selectedProducts.length} נבחרו)</Label>
            <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                  />
                  <Label htmlFor={`product-${product.id}`} className="cursor-pointer">
                    {product.name}
                  </Label>
                </div>
              ))}
            </div>
            {errors.product_ids && <p className="text-sm text-red-600">{errors.product_ids.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">אמצעי תשלום *</Label>
            <Select
              value={watch('payment_method')}
              onValueChange={(value) => setValue('payment_method', value as 'cash' | 'bit', { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר אמצעי תשלום" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">מזומן</SelectItem>
                <SelectItem value="bit">ביט</SelectItem>
              </SelectContent>
            </Select>
            {errors.payment_method && <p className="text-sm text-red-600">{errors.payment_method.message}</p>}
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="is_paid"
              checked={watch('is_paid')}
              onCheckedChange={(checked) => setValue('is_paid', checked as boolean, { shouldValidate: true })}
            />
            <Label htmlFor="is_paid">שולם</Label>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-lg font-bold">סה"כ: {formatPrice(totalPrice)}</p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                reset()
                setSelectedProducts([])
              }}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'שומר...' : 'שמור'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
