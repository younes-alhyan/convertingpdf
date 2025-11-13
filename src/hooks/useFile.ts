import { type FileEntry, useIndexedDB } from "./useIndedxDB";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type useFileProps = {
  original_file: File;
  formData: FormData;
  setResult: React.Dispatch<React.SetStateAction<FileEntry | null>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  conversion_type: string;
};

interface conversionsType {
  objective: string;
  extention: string;
}

const conversionTypesRecord: Record<string, conversionsType> = {
  "compress-pdf": { objective: "Compression", extention: "_compressed.pdf" },
  edit: { objective: "edit", extention: "_edited.pdf" },
  "merge-pdf": { objective: "merge", extention: "_merged.pdf" },
  "pdf-to-jpg": { objective: "conversion", extention: "_jpg.zip" },
  "pdf-to-word": { objective: "conversion", extention: ".docx" },
  "split-pdf": { objective: "split", extention: "_split.zip" },
};

export function useFile() {
  const { saveFile } = useIndexedDB();

  const ConvertFile = async ({
    original_file,
    formData,
    setResult,
    setProgress,
    conversion_type,
  }: useFileProps) => {
    const created_at = new Date().toISOString();
    let resultEntry: FileEntry = {
      id: generateUUID(),
      original_filename: original_file.name,
      converted_filename: null,
      conversion_type,
      status: "pending",
      created_at,
      completed_at: null,
      file_size: original_file.size,
      blob: original_file,
    };
    setProgress(10);
    setResult(resultEntry); // initial state

    try {
      const response = await fetch(
        `https://convertingpdf-server.onrender.com/${conversion_type}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error ||
            `${conversionTypesRecord[conversion_type].objective} failed`
        );
      }

      setProgress(30);
      resultEntry.status = "processing";
      setResult({ ...resultEntry });

      // get the Blob from response
      const blob = await response.blob();
      const completed_at = new Date().toISOString();

      // fill the result
      resultEntry = {
        ...resultEntry,
        converted_filename: original_file.name.replace(
          ".pdf",
          conversionTypesRecord[conversion_type].extention
        ),
        blob: blob,
        status: "completed",
        completed_at,
        file_size: blob.size,
      };
      setResult(resultEntry);
      setProgress(100);

      // save file in localStorage + IndexedDB
      await saveFile(resultEntry);
      return resultEntry;
    } catch (err) {
      resultEntry.status = "failed";
      setResult({ ...resultEntry });
      setProgress(0);
      throw err;
    }
  };
  return ConvertFile;
}
