import React, { useRef } from "react";
import type { Batch } from "../types";
import { uploadFormats } from "./upload-formats";

function UploadCard({
  provider,
  disabled,
  upload,
}: {
  provider: Batch["provider"];
  disabled: boolean;
  upload: (file: File, provider: Batch["provider"]) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const format = uploadFormats[provider];
  const name = format.name;
  return (
    <div>
      <button
        className={`pm-upload-card pm-upload-${provider}`}
        aria-label={`打开${name}账单上传`}
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        <span className="pm-upload-icon" aria-hidden="true">
          {provider === "alipay" ? "支" : "微"}
        </span>
        <span>
          <strong>{name}账单</strong>
          <small>仅支持 {format.extension.slice(1).toUpperCase()}</small>
        </span>
        <span className="pm-upload-arrow" aria-hidden="true">
          ↑
        </span>
      </button>
      <input
        ref={input}
        hidden
        type="file"
        aria-label={`上传${name}账单`}
        accept={format.accept}
        disabled={disabled}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) void upload(file, provider);
        }}
      />
    </div>
  );
}

export function UploadCards(props: {
  disabled: boolean;
  upload: (file: File, provider: Batch["provider"]) => Promise<void>;
}) {
  return (
    <div className="pm-upload-grid">
      <UploadCard provider="alipay" {...props} />
      <UploadCard provider="wechat" {...props} />
    </div>
  );
}
