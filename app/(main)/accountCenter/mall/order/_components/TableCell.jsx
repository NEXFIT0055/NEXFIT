export function Th({ children, className = "" }) {
  return (
    <th
      className={`px-6 py-3 border-t border-b text-left font-medium border-borderColor text-fontColor ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return (
    <td
      className={`px-6 py-3 border-t border-b border-borderColor text-fontColor ${className}`}
    >
      {children}
    </td>
  );
}
