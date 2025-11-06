import { useState, useMemo } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatNaira } from "@/utils/formatters";

const TipUserSection = () => {
  const [name, setName] = useState<string>("");
  const [xHandle, setXHandle] = useState<string | null>("");
  const [message, setMessage] = useState<string>("");
  const [smilesCount, setSmilesCount] = useState<number>(1);

  const pricePerSmile = 300;
  const totalAmt = useMemo(
    () => pricePerSmile * smilesCount,
    [pricePerSmile, smilesCount]
  );

  const defaultSmiles: number[] = [1, 3, 5];

  return (
    <section
      aria-label="Tip Charmingdc"
      className="w-[92%] flex flex-col gap-3 bg-background p-6 rounded-lg shadow-card shadow-md"
    >
      <h3 className="font-bold text-lg mb-2"> Send Charming Dc Smiles </h3>

      <form
        className="w-full flex flex-col gap-3 items-center"
        onSubmit={e => e.preventDefault()}
      >
        <div className="w-full h-16 flex items-center gap-2 bg-accent px-3 rounded-md">
          <div className="h-full flex items-center gap-2">
            <span className="text-xl"> 😊 </span>
            <X size={16} className="text-muted-foreground" />
          </div>

          {defaultSmiles.map(smile => (
            <div
              key={smile}
              onClick={() => setSmilesCount(smile)}
              className={`w-14 h-10 flex items-center justify-center bg-background font-bold text-muted-foreground text-lg border rounded-sm transition-all duration-300 ${
                smile === smilesCount ? "border-primary" : "border-border"
              }`}
            >
              {smile}
            </div>
          ))}

          <input
            type="number"
            name="smile_count"
            value={smilesCount}
            onChange={e => setSmilesCount(Number(e.target.value))}
            className="w-14 h-10 flex items-center justify-center bg-background p-2 font-bold text-center text-input-foreground text-lg border-2 rounded-sm transition-all duration-300 focus:border-primary"
          />
        </div>

        <Input
          type="text"
          name="name"
          value={name}
          placeholder="Name"
          onChange={e => setName(e.target.value)}
        />

        <Input
          type="text"
          name="x_handle"
          value={xHandle ?? ""}
          placeholder="Your X (twitter) handle - optional"
          onChange={e => setXHandle(e.target.value || null)}
        />

        <textarea
          name="message"
          value={message}
          placeholder="Say something nice..."
          onChange={e => setMessage(e.target.value)}
          className="w-full h-[10rem] p-3 text-sm bg-input text-input-foreground
          border border-input rounded-lg"
        ></textarea>

        <Button className="w-full font-bold mt-3">
          Support {`${smilesCount < 1 ? "" : formatNaira(totalAmt)}`}
        </Button>
      </form>
    </section>
  );
};

export default TipUserSection;
