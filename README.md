## TODO

- [x] Home
- [x] Search
- [x] Genres
- [ ] Details
- [x] Hentai
- [x] 3D Hentai
- [x] JAV
- [x] JAV Cosplay
- [x] Hentai List
- [x] JAV List
- [x] Genre List
  

## Usage

1. Clone this repository

```bash
git clone https://github.com/nsfw-content/nekopoi-api-unofficial.git
```

2. Install packages (use `yarn` or `npm`)

```bash
npm install
```

3. Start server

- Production

```bash
npm run start
```

- Development

```bash
npm run dev
```

## API Documentation

**API Version** : v1

| Endpoint                  | Params                        | Default                                                   | Example                                   |
| ------------------------- | ----------------------------- | --------------------------------------------------------- | ----------------------------------------- |
| /home/:page               | page : Int                    | page: 1                                                   | https://site.com/api/home/1               |
| /search/:page/?s=         | page : Int, s : String        | page: 1                                                   | https://site.com/api/search/1/?s=netorare |
| /category/:category/:page | page : Int, category : String | page : 1, category : [hentai,3d-hentai, jav, jav-cosplay] | https://site.com/api/category/hentai/1    |
| /lists/:list              | list : String                 | list: [hentai, jav, genre]                                | https://site.com/api/lists/genre          |
| /genres/:genre/:page      | genre : String, page : Int    | page : 1                                                  | https://site.com/api/genres/netorare/2    |


