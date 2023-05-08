export interface Track {
  id: string,
  name: string,
  album: Album,
  artists: string[]
}

export interface Album {
  name: string,
  image: Image,
}

export interface Image {
  url: string,
  width: number,
  height: number
}

export interface Tag {
  tagID: number,
  userID: string,
  name: string,
  color: number,
  description?: string,
  tracks: string[]
}
