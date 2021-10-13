
## TODO

- [x] Home
- [x] Search
- [ ] Hentai
- [ ] 3D Hentai
- [ ] JAV
- [ ] JAV Cosplay
- [ ] Hentai List
- [ ] JAV List
- [ ] Genre List
- [ ] Details 
  

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

| Endpoint          | Params                 | Default | Example                                        |
| ----------------- | ---------------------- | ------- | ---------------------------------------------- |
| /home/:page       | page : Int             | page: 1 | https://site.com/api/home/1                    |
| /search/:page/?s= | page : Int, s : String | page: 1 | https://site.com/api/home/1/search/?s=netorare |

