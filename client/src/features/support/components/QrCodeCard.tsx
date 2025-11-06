import { useEffect, useState } from "react";

const QrCodeCard = ({
  qrSrc,
  username
}: {
  qrSrc: string;
  username: string;
}) => {
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  useEffect(() => {
    async function fetchImage() {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    }
    fetchImage();
  }, [qrSrc]);

  return (
    <div>
      <img src={qrSrc} className="rounded-md" alt={`${username}'s QR Code`} />

      {downloadUrl && (
        <a
          href={downloadUrl}
          download={`${username}-qr.png`}
          className="w-full text-primary text-center underline mt-2 inline-block"
        >
          Download QrCode
        </a>
      )}
    </div>
  );
};

export default QrCodeCard;
