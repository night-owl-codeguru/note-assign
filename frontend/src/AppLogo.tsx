import logo from '../assets/logo.png'

export default function AppLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="logo" className="h-8 w-8" />
      <span className="font-bold text-2xl text-black">HD</span>
    </div>
  )
}
