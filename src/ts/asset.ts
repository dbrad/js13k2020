import { TextureAssetJson, loadSpriteSheet } from "./texture.js";

type AssetJson = TextureAssetJson;

export async function loadAsset(name: string): Promise<{}>
{
    // @ifdef DEBUG
    console.log("FETCHING ASSET => " + name);
    // @endif

    const raw = document.querySelector("#" + name).innerHTML;
    const asset: AssetJson = JSON.parse(raw);

    // @ifdef DEBUG
    console.log("ASSET FETCHED => " + asset.name);
    // @endif

    if (asset.type === "textures")
    {
        return loadSpriteSheet(asset);
    }

    // @ifdef DEBUG
    throw new Error("UNDEFINED ASSET TYPE => " + asset.type);
    // @endif
}