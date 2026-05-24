const rainDrops = Array.from({ length: 46 }, (_, index) => ({
  left: `${(index * 17) % 100}%`,
  delay: `${(index % 13) * -0.18}s`,
  duration: `${0.75 + (index % 5) * 0.08}s`,
  opacity: 0.16 + (index % 4) * 0.06,
}))

const snowFlakes = Array.from({ length: 34 }, (_, index) => ({
  left: `${(index * 23) % 100}%`,
  delay: `${(index % 17) * -0.35}s`,
  duration: `${6 + (index % 8) * 0.7}s`,
  size: `${3 + (index % 5)}px`,
  drift: `${index % 2 ? 18 : -18}px`,
}))

const spaceStars = Array.from({ length: 58 }, (_, index) => ({
  top: `${(index * 37) % 100}%`,
  left: `${(index * 61) % 100}%`,
  delay: `${(index % 19) * -0.28}s`,
  size: `${1 + (index % 3) * 0.55}px`,
  opacity: 0.18 + (index % 5) * 0.08,
}))

const mapleLeaves = Array.from({ length: 24 }, (_, index) => ({
  left: `${(index * 19) % 100}%`,
  delay: `${(index % 12) * -0.65}s`,
  duration: `${7.5 + (index % 7) * 0.65}s`,
  size: `${12 + (index % 4) * 3}px`,
  drift: `${index % 2 ? 70 : -70}px`,
  rotate: `${index % 2 ? 360 : -360}deg`,
}))

export default function ThemeAtmosphere() {
  return (
    <div className="theme-atmosphere" aria-hidden="true">
      <div className="theme-neon-fx">
        <span className="dark-scan dark-scan-a" />
        <span className="dark-scan dark-scan-b" />
        <span className="dark-vignette" />
      </div>

      <div className="theme-rain">
        {rainDrops.map((drop, index) => (
          <span
            key={index}
            style={{
              left: drop.left,
              animationDelay: drop.delay,
              animationDuration: drop.duration,
              opacity: drop.opacity,
            }}
          />
        ))}
      </div>

      <div className="theme-snow">
        {snowFlakes.map((flake, index) => (
          <span
            key={index}
            style={{
              left: flake.left,
              animationDelay: flake.delay,
              animationDuration: flake.duration,
              width: flake.size,
              height: flake.size,
              '--snow-drift': flake.drift,
            }}
          />
        ))}
      </div>

      <div className="theme-dark-fx">
        <span className="space-nebula space-nebula-a" />
        <span className="space-nebula space-nebula-b" />
        <span className="space-nebula space-nebula-c" />
        <span className="space-starfield">
          {spaceStars.map((star, index) => (
            <span
              key={index}
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                animationDelay: star.delay,
              }}
            />
          ))}
        </span>
      </div>

      <div className="theme-solar-fx">
        <span className="leaf-haze leaf-haze-a" />
        <span className="leaf-haze leaf-haze-b" />
        {mapleLeaves.map((leaf, index) => (
          <span
            key={index}
            className="maple-leaf"
            style={{
              left: leaf.left,
              fontSize: leaf.size,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
              '--leaf-drift': leaf.drift,
              '--leaf-rotate': leaf.rotate,
            }}
          >
            🍁
          </span>
        ))}
      </div>
    </div>
  )
}
