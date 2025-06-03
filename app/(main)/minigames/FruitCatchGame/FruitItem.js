
export default function FruitItem({ top, left, type }) {
    return (
      <div
        className="absolute text-2xl"
        style={{ top: `${top}px`, left: `${left}px`, transition: 'top 0.05s linear' }}
      >
        {type}
      </div>
    );
  }
  