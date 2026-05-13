"use client";

// Image not used yet; keep simple <img> for now
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CONTACT_INFO } from "../../../michiel-jewelry-app/constants/Config";

interface Product {
  id: string;
  nameAr: string;
  descriptionAr?: string | null;
  price?: number | null;
  karat: number;
  weight?: number | null;
  images?: string[];
}

export function ProductQuickView({ product }: Readonly<{ product: Product }>) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-black/70 text-yellow-200 border border-yellow-500/40 hover:bg-black/80 cursor-pointer">
          عرض التفاصيل
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product.nameAr}</DialogTitle>
          <DialogDescription>عيار {product.karat} {product.weight ? `• ${product.weight} جم` : ''}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          {product.images && product.images.length > 0 ? (
            <div className="w-full h-64 relative rounded-md overflow-hidden bg-gray-800">
              <Image
                src={product.images[0]}
                alt={product.nameAr}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          ) : (
            <div className="w-full h-64 rounded-md bg-gray-800" />
          )}

          <div className="text-right text-gray-300">
            <p className="mb-3">{product.descriptionAr || 'لا توجد تفاصيل إضافية'}</p>
            <p className="text-2xl font-bold text-yellow-400 mb-2">{product.price ? product.price.toLocaleString('ar-EG') + ' ج.م' : 'تواصل للسعر'}</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-right text-sm text-gray-300 mb-4">
          <p className="mb-2 font-semibold text-yellow-400">هل تحتاج إلى مزيد من المعلومات؟</p>
          <p>
            للطلب والاستفسارات، يرجى التواصل معنا عبر{" "}
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(
                `استفسار عن: ${product.nameAr}\n` +
                `العيار: ${product.karat}\n` +
                `الوزن: ${product.weight ? product.weight + ' جم' : 'غير محدد'}\n` +
                `السعر: ${product.price ? product.price + ' ج.م' : 'تواصل للسعر'}\n` +
                `الرابط: ${typeof window !== 'undefined' ? window.location.origin : ''}/product/${product.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 font-bold hover:underline"
            >
              الواتس أب
            </a>{" "}
            أو{" "}
            <a
              href={`tel:${CONTACT_INFO.phoneNumber}`}
              className="text-yellow-400 font-bold hover:underline"
            >
              رقم الهاتف
            </a>
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="default" className="w-full cursor-pointer">إغلاق</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProductQuickView;
