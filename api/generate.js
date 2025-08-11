import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "File parsing failed" });
    }

    const prompt = fields.prompt;
    const imageFile = files.file;

    try {
      // Read the file as base64
      const fileData = fs.readFileSync(imageFile.filepath, { encoding: "base64" });

      // Send to Replicate API
      const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          version: "REPLICATE_MODEL_VERSION_ID", // Replace
          input: {
            prompt: prompt,
            image: `data:image/jpeg;base64,${fileData}`
          }
        })
      });

      const data = await replicateRes.json();
      res.status(200).json(data);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
}
