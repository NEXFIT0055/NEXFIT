
export default function CharacterBasket({ left, basketRef }) {
    return (
      <div
        ref={basketRef}
        className="absolute bottom-0 flex flex-col items-center transition-all duration-75"
        style={{ left }}
      >
        <div className="text-3xl">👨‍🌾</div>
        <div className="w-[50px] h-[20px] bg-blue-500 rounded-t-lg mt-[-8px]" />
      </div>
    );
  }
  