export default function PlantIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>

      <g className="animate-gentle-sway origin-bottom">
        <path
          d="M12 3C12 3 8 5 8 9C8 11.5 9.5 13 12 14"
          stroke="url(#leafGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animate-leaf-flutter"
          style={{ animationDelay: '0ms' }}
        />

        <path
          d="M12 3C12 3 16 5 16 9C16 11.5 14.5 13 12 14"
          stroke="url(#leafGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animate-leaf-flutter"
          style={{ animationDelay: '150ms' }}
        />

        <path
          d="M12 14C12 14 10 16 10 19C10 20.5 11 21.5 12 22"
          stroke="url(#leafGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animate-leaf-flutter"
          style={{ animationDelay: '300ms' }}
        />

        <path
          d="M12 14C12 14 14 16 14 19C14 20.5 13 21.5 12 22"
          stroke="url(#leafGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animate-leaf-flutter"
          style={{ animationDelay: '450ms' }}
        />

        <path
          d="M12 14V22"
          stroke="#15803d"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
