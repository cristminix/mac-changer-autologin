import { runAsAdmin } from "@/global/fn/runAsAdmin";

export const spawnTmac = async () => {
  const unzip = async (
    zipPath: string,
    destinationPath: string,
  ): Promise<string> =>
    await runAsAdmin(
      `"Expand-Archive -Path '${zipPath}' -DestinationPath '${destinationPath}'"`,
    );
};
