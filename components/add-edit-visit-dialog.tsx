'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
  private_house: z.boolean(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  building_code: z.string().optional(),
  payment_method: z.enum(['cash', 'bit']),
  is_paid: z.boolean(),
  product_quantities: z.record(z.number().min(0)),
}).refine((data) => {
  // If not a private house, floor and apartment are required
  if (!data.private_house) {
    return data.floor && data.floor.length > 0 && data.apartment && data.apartment.length > 0
  }
  return true
}, {
  message: 'קומה ודירה חובה עבור בניין',
  path: ['floor'],
}).refine((data) => {
  // At least one product with quantity > 0
  return Object.values(data.product_quantities).some(qty => qty > 0)
}, {
  message: 'יש לבחור לפחות מוצר אחד',
  path: ['product_quantities'],
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
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({})

  const {
    control,
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
      private_house: false,
      floor: '',
      apartment: '',
      building_code: '',
      payment_method: 'cash',
      is_paid: false,
      product_quantities: {},
    },
  })

  useEffect(() => {
    if (visit) {
      const quantities: Record<string, number> = {}
      visit.products.forEach(p => {
        quantities[p.id] = p.quantity
      })

      reset({
        name: visit.name,
        phone: visit.phone,
        address: visit.address,
        private_house: visit.private_house,
        floor: visit.floor || '',
        apartment: visit.apartment || '',
        building_code: visit.building_code || '',
        payment_method: visit.payment_method,
        is_paid: visit.is_paid,
        product_quantities: quantities,
      })
      setProductQuantities(quantities)
    } else {
      // Initialize all products with 0 quantity
      const initialQuantities: Record<string, number> = {}
      products.forEach(p => {
        initialQuantities[p.id] = 0
      })
      setProductQuantities(initialQuantities)
      setValue('product_quantities', initialQuantities)
    }
  }, [visit, products, reset, setValue])

  const updateQuantity = (productId: string, quantity: number) => {
    const newQuantities = { ...productQuantities, [productId]: Math.max(0, quantity) }
    setProductQuantities(newQuantities)
    setValue('product_quantities', newQuantities, { shouldValidate: true })
  }

  const totalProducts = Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0)
  const totalPrice = calculateTotalPrice(totalProducts)

  const onSubmit = async (data: VisitFormData) => {
    setIsLoading(true)

    try {
      // Filter out products with 0 quantity
      const filteredQuantities: Record<string, number> = {}
      Object.entries(data.product_quantities).forEach(([id, qty]) => {
        if (qty > 0) {
          filteredQuantities[id] = qty
        }
      })

      const input: CreateVisitInput = {
        ...data,
        product_quantities: filteredQuantities,
        visit_day_id: visitDayId,
      }

      if (visit) {
        await updateVisit(visit.id, input)
      } else {
        await createVisit(input)
      }

      onOpenChange(false)
      reset()
      const initialQuantities: Record<string, number> = {}
      products.forEach(p => {
        initialQuantities[p.id] = 0
      })
      setProductQuantities(initialQuantities)
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
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" {...field} />}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">טלפון *</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <Input id="phone" {...field} />}
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">כתובת *</Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => <Input id="address" {...field} />}
            />
            {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="private_house"
              checked={watch('private_house')}
              onCheckedChange={(checked) => setValue('private_house', checked as boolean, { shouldValidate: true })}
            />
            <Label htmlFor="private_house">בית פרטי</Label>
          </div>

          {!watch('private_house') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">קומה *</Label>
                <Controller
                  name="floor"
                  control={control}
                  render={({ field }) => <Input id="floor" {...field} />}
                />
                {errors.floor && <p className="text-sm text-red-600">{errors.floor.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment">דירה *</Label>
                <Controller
                  name="apartment"
                  control={control}
                  render={({ field }) => <Input id="apartment" {...field} />}
                />
                {errors.apartment && <p className="text-sm text-red-600">{errors.apartment.message}</p>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="building_code">קוד בניין</Label>
            <Controller
              name="building_code"
              control={control}
              render={({ field }) => <Input id="building_code" {...field} />}
            />
            {errors.building_code && <p className="text-sm text-red-600">{errors.building_code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>מוצרים * (סה"כ {totalProducts} מוצרים)</Label>
            <div className={`border rounded-md p-4 space-y-3 max-h-60 overflow-y-auto ${totalProducts === 0 && errors.product_quantities ? 'border-red-500' : ''}`}>
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <Label htmlFor={`product-${product.id}`} className="flex-1">
                    {product.name}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(product.id, (productQuantities[product.id] || 0) - 1)}
                      disabled={!productQuantities[product.id] || productQuantities[product.id] === 0}
                    >
                      -
                    </Button>
                    <Input
                      id={`product-${product.id}`}
                      type="number"
                      min="0"
                      value={productQuantities[product.id] || 0}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                      className="w-16 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(product.id, (productQuantities[product.id] || 0) + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {errors.product_quantities && <p className="text-sm text-red-600">{errors.product_quantities.message}</p>}
            {totalProducts === 0 && !errors.product_quantities && (
              <p className="text-sm text-gray-500">יש לבחור לפחות מוצר אחד</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">אמצעי תשלום *</Label>
            <Select
              value={watch('payment_method')}
              onValueChange={(value) => setValue('payment_method', value as 'cash' | 'bit', { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר אמצעי תשלום">
                  {watch('payment_method') === 'cash' ? 'מזומן' : watch('payment_method') === 'bit' ? 'ביט' : 'בחר אמצעי תשלום'}
                </SelectValue>
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
                const initialQuantities: Record<string, number> = {}
                products.forEach(p => {
                  initialQuantities[p.id] = 0
                })
                setProductQuantities(initialQuantities)
              }}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading || totalProducts === 0}>
              {isLoading ? 'שומר...' : 'שמור'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
