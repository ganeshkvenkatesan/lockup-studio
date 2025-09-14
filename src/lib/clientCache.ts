type ImagesByGroup = Record<string, Array<{ pathname: string; url: string }>>;

const cache: { groups?: ImagesByGroup } = {};

export function setGroups(g: ImagesByGroup) {
  cache.groups = g;
}

export function getGroups(): ImagesByGroup | undefined {
  return cache.groups;
}

export function getGroup(name: string) {
  return cache.groups ? cache.groups[name] : undefined;
}
