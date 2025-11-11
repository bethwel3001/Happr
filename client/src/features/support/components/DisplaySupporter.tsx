import type { Supporter } from "@/features/supporters";

const DisplaySupporter = ({ supporter }: { supporter: Supporter }) => {
  const supporterName = supporter.info.name;

  return (
    <div
      key={supporter.id}
      className="w-full flex items-center gap-1 bg-accent p-3 rounded-sm"
    >
      {supporter.info.xHandle ? (
        <a
          href={`https://x.com/${supporterName}`}
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2 font-bold text-primary"
        >
          @{supporterName}
        </a>
      ) : (
        <span className="font-bold">{supporterName}</span>
      )}
      <span>
        {" "}
        sent <strong>x{supporter.smileCount}</strong> smiles 😊
      </span>
    </div>
  );
};
export default DisplaySupporter;
