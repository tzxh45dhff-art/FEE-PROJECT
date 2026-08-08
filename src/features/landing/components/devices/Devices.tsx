import { DeviceScreen } from '@/features/landing/components/devices/DeviceScreen'
import { cn } from '@/lib/utils'

/*
 * Pure-CSS device frames.
 *
 * Each frame is a container and its screen chrome is sized in `cqw`, so the
 * mock UI scales with the device instead of being fixed px that look enormous
 * on a phone and microscopic on an iMac.
 */

export function Phone({ className }: { className?: string }) {
  return (
    <div className={cn('@container', className)}>
      <div className="relative rounded-[13%] bg-[linear-gradient(160deg,#2c2c30,#141417)] p-[2.4%] text-[6.4cqw] shadow-[0_36px_70px_-36px_rgb(0_0_0/0.95)] ring-1 ring-white/10">
        <div className="relative aspect-[9/19] overflow-hidden rounded-[11%] ring-1 ring-black/60">
          <DeviceScreen slot="phone" sourceIndex={0} compact />
          <div className="absolute left-1/2 top-[1.5%] h-[2.2%] w-[26%] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  )
}

export function Tablet({ className }: { className?: string }) {
  return (
    <div className={cn('@container', className)}>
      <div className="relative rounded-[5%] bg-[linear-gradient(160deg,#2c2c30,#141417)] p-[2%] text-[3.6cqw] shadow-[0_36px_70px_-36px_rgb(0_0_0/0.95)] ring-1 ring-white/10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[3%] ring-1 ring-black/60">
          <DeviceScreen slot="tablet" sourceIndex={1} />
        </div>
      </div>
    </div>
  )
}

export function Laptop({ className }: { className?: string }) {
  return (
    <div className={cn('@container', className)}>
      <div className="flex flex-col items-center text-[2.5cqw]">
        <div className="w-full rounded-[4%] bg-[linear-gradient(160deg,#2c2c30,#151518)] p-[1.6%] shadow-[0_36px_70px_-36px_rgb(0_0_0/0.95)] ring-1 ring-white/10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2%] ring-1 ring-black/60">
            <DeviceScreen slot="laptop" sourceIndex={2} />
          </div>
        </div>
        {/* Hinge + base */}
        <div className="h-[1.6cqw] w-[112%] rounded-b-[0.35rem] bg-[linear-gradient(to_bottom,#3a3a3f,#1b1b1e)] ring-1 ring-white/[0.06]" />
        <div className="h-[0.8cqw] w-[26%] rounded-b-full bg-black/70" />
      </div>
    </div>
  )
}

export function IMac({ className }: { className?: string }) {
  return (
    <div className={cn('@container', className)}>
      <div className="flex flex-col items-center text-[2.4cqw]">
        <div className="w-full rounded-[2.5%] bg-[linear-gradient(160deg,#28282c,#111113)] p-[1.2%] pb-[7%] shadow-[0_36px_70px_-36px_rgb(0_0_0/0.95)] ring-1 ring-white/10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[1.2%] ring-1 ring-black/60">
            <DeviceScreen slot="imac" sourceIndex={3} />
          </div>
        </div>
        {/* Chin taper into the stand */}
        <div className="h-[5cqw] w-[16%] bg-[linear-gradient(to_bottom,#26262a,#171719)]" />
        <div className="h-[1.2cqw] w-[34%] rounded-full bg-[linear-gradient(to_bottom,#2f2f34,#141416)] ring-1 ring-white/[0.06]" />
      </div>
    </div>
  )
}
