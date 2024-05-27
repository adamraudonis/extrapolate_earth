// Example explorer link:
// https://ourworldindata.org/explorers/energy?tab=chart&facet=none&country=~OWID_WRL&Total+or+Breakdown=Total&Energy+or+Electricity=Electricity+only&Metric=Annual+generation

// Example chart link:
// https://ourworldindata.org/grapher/share-electricity-solar?tab=chart&country=~USA

// Example of limited metadata:
// https://api.ourworldindata.org/v1/indicators/90000.metadata.json

// Example of full metadata:
// https://api.ourworldindata.org/v1/indicators/901056.metadata.json

export interface OWIDEntity {
  id: number;
  name: string;
  code: string | null;
}

export interface OWIDDimension {
  values: OWIDEntity[];
}

export interface OWIDDimensions {
  entities: OWIDDimension;
}

export interface OWIDMetadata {
  id: number;
  name: string;
  unit: string;
  descriptionShort?: string;
  descriptionKey?: string[];
  presentation?: OWIDPresentation;
  display?: OWIDDisplay;
  dimensions: OWIDDimensions;
}

export interface OWIDPresentation {
  titlePublic: string;
  topicTagsLinks: string[];
}

export interface OWIDDisplay {
  name: string;
  unit: string;
  shortUnit: string;
}

export interface OWIDinfo {
  metadata: OWIDMetadata;
  years: number[];
  values: number[];
}

export const getVariableId = async (url: string): Promise<number> => {
  if (!url.includes('https://ourworldindata.org')) {
    throw new Error('Invalid url. Must be from ourworldindata.org');
  }

  const response = await fetch(url);
  const htmlContent = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const scriptTag = Array.from(doc.scripts).find((script) =>
    script.textContent?.includes('window._OWID_GRAPHER_CONFIG')
  );
  if (!scriptTag) {
    throw new Error(
      'Could not find the OWID_GRAPHER_CONFIG script tag in the HTML content.'
    );
  }

  const scriptContent = scriptTag.textContent;
  if (!scriptContent) {
    throw new Error('Script tag content is empty.');
  }

  const regex = /"variableId":\s*(\d+)/;
  const match = scriptContent.match(regex);

  if (match) {
    return parseInt(match[1], 10);
  } else {
    throw new Error('Could not find the variableId in the script content.');
  }
};

export const getOWIDinfo = async (url: string): Promise<OWIDinfo> => {
  // Consider forcing param tab=chart
  const urlParams = new URLSearchParams(url);
  const countryCode = urlParams.get('country')?.replace('~', '') || 'OWID_WRL';

  const variableId: number = await getVariableId(url);
  const metadataUrl = `https://api.ourworldindata.org/v1/indicators/${variableId}.metadata.json`;
  const response = await fetch(metadataUrl);
  const metadata: OWIDMetadata = await response.json();
  // Warning some countries like africa have code = null but when you use url it is some OWID_ thing

  const entity = metadata.dimensions.entities.values.find(
    (entity: OWIDEntity) => entity.code === countryCode
  );
  const entityId: number | null = entity ? entity.id : null;
  if (!entityId) {
    throw new Error(
      `Could not find entity id for country code: ${countryCode}`
    );
  }

  const dataUrl = `https://api.ourworldindata.org/v1/indicators/${variableId}.data.json`;
  const response2 = await fetch(dataUrl);
  const data = await response2.json();
  const { values, years, entities } = data;

  const filteredIndices = entities
    .map((entity: number, index: number) => (entity === entityId ? index : -1))
    .filter((index: number) => index !== -1);

  const filteredValues = filteredIndices.map((index: number) => values[index]);
  const filteredYears = filteredIndices.map((index: number) => years[index]);
  return {
    metadata,
    years: filteredYears,
    values: filteredValues,
  };
};
