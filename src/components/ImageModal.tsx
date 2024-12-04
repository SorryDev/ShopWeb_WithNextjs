import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from 'next/image'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <div className="relative w-full h-[80vh]">
          <Image
            src={imageUrl}
            alt="Proof of payment"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

