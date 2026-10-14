const cors = require('cors');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PRODUCTS_DIR = path.join(PUBLIC_DIR, 'products');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, UPLOADS_DIR),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname) || '.jpg';
      callback(null, `${Date.now()}-${uuidv4()}${extension}`);
    },
  }),
});

app.use(cors());
app.use(express.json());
app.use(
  '/products',
  express.static(PRODUCTS_DIR, {
    immutable: true,
    maxAge: '30d',
  })
);
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    immutable: true,
    maxAge: '30d',
  })
);

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`);
}

function createToken(userId) {
  return `dev-token-${userId}`;
}

function getUserByToken(token, db) {
  if (!token?.startsWith('dev-token-')) {
    return null;
  }

  const userId = token.replace('dev-token-', '');
  return db.users.find((user) => user.id === userId) || null;
}

function getAuthToken(req) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  return token || null;
}

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function getHomeProductIds(db, user) {
  const orderedIds = [];
  const seen = new Set();

  const pushId = (productId) => {
    if (!productId || seen.has(productId)) {
      return;
    }

    seen.add(productId);
    orderedIds.push(productId);
  };

  user.listingIds.forEach(pushId);
  db.defaults.homeOrder.forEach(pushId);
  db.products.forEach((product) => pushId(product.id));

  return orderedIds;
}

function serializeProduct(req, product, user) {
  return {
    ...product,
    imageUrl: `${getBaseUrl(req)}${product.imagePath}`,
    isFavorite: user.favoriteIds.includes(product.id),
    isOwnListing: user.listingIds.includes(product.id),
  };
}

function authMiddleware(req, res, next) {
  const db = readDb();
  const user = getUserByToken(getAuthToken(req), db);

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  req.db = db;
  req.user = user;
  next();
}

function buildBootstrap(req, db, user) {
  const homeProducts = getHomeProductIds(db, user)
    .map((productId) => db.products.find((product) => product.id === productId))
    .filter(Boolean)
    .map((product) => serializeProduct(req, product, user));

  const favorites = user.favoriteIds
    .map((productId) => db.products.find((product) => product.id === productId))
    .filter(Boolean)
    .map((product) => serializeProduct(req, product, user));

  const listings = user.listingIds
    .map((productId) => db.products.find((product) => product.id === productId))
    .filter(Boolean)
    .map((product) => serializeProduct(req, product, user));

  return {
    categories: db.categories,
    homeProducts,
    favorites,
    listings,
    products: db.products.map((product) => serializeProduct(req, product, user)),
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      listingsSummary: `Already have ${user.listingIds.length} listing${user.listingIds.length === 1 ? '' : 's'}`,
      settingsSummary: 'Account, FAQ, Contact',
    },
    helpCenter: db.helpCenter,
  };
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/demo', (req, res) => {
  const db = readDb();
  const user = db.users[0];

  res.json({
    token: createToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

app.post('/auth/sign-in', (req, res) => {
  const db = readDb();
  const { email, password } = req.body;
  const user = db.users.find(
    (candidate) =>
      candidate.email.toLowerCase() === String(email || '').trim().toLowerCase() &&
      candidate.password === password
  );

  if (!user) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  res.json({
    token: createToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

app.post('/auth/sign-up', (req, res) => {
  const db = readDb();
  const { name, email, password } = req.body;
  const trimmedEmail = String(email || '').trim().toLowerCase();

  if (!name || !trimmedEmail || !password) {
    res.status(400).json({ message: 'Name, email, and password are required.' });
    return;
  }

  if (db.users.some((user) => user.email.toLowerCase() === trimmedEmail)) {
    res.status(409).json({ message: 'An account with that email already exists.' });
    return;
  }

  const newUser = {
    id: `user-${uuidv4()}`,
    name: String(name).trim(),
    email: trimmedEmail,
    password,
    favoriteIds: [...db.defaults.favoriteIds],
    listingIds: [...db.defaults.listingIds],
  };

  db.users.push(newUser);
  writeDb(db);

  res.status(201).json({
    token: createToken(newUser.id),
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  });
});

app.get('/bootstrap', authMiddleware, (req, res) => {
  res.json(buildBootstrap(req, req.db, req.user));
});

app.get('/products/:productId', authMiddleware, (req, res) => {
  const product = req.db.products.find((entry) => entry.id === req.params.productId);

  if (!product) {
    res.status(404).json({ message: 'Product not found.' });
    return;
  }

  res.json(serializeProduct(req, product, req.user));
});

app.put('/profile', authMiddleware, (req, res) => {
  const { name, email } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!name || !normalizedEmail) {
    res.status(400).json({ message: 'Name and email are required.' });
    return;
  }

  const emailOwner = req.db.users.find(
    (user) => user.email.toLowerCase() === normalizedEmail && user.id !== req.user.id
  );

  if (emailOwner) {
    res.status(409).json({ message: 'That email is already in use.' });
    return;
  }

  const currentUser = req.db.users.find((user) => user.id === req.user.id);
  currentUser.name = String(name).trim();
  currentUser.email = normalizedEmail;
  writeDb(req.db);

  res.json({
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    listingsSummary: `Already have ${currentUser.listingIds.length} listing${currentUser.listingIds.length === 1 ? '' : 's'}`,
    settingsSummary: 'Account, FAQ, Contact',
  });
});

app.post('/favorites/:productId/toggle', authMiddleware, (req, res) => {
  const currentUser = req.db.users.find((user) => user.id === req.user.id);
  const productExists = req.db.products.some((product) => product.id === req.params.productId);

  if (!productExists) {
    res.status(404).json({ message: 'Product not found.' });
    return;
  }

  if (currentUser.favoriteIds.includes(req.params.productId)) {
    currentUser.favoriteIds = currentUser.favoriteIds.filter((id) => id !== req.params.productId);
  } else {
    currentUser.favoriteIds.unshift(req.params.productId);
  }

  writeDb(req.db);
  res.json(buildBootstrap(req, req.db, currentUser));
});

app.post('/listings', authMiddleware, upload.single('image'), (req, res) => {
  const { title, category, price, description } = req.body;

  if (!title || !category || !price || !description || !req.file) {
    res.status(400).json({ message: 'Title, category, price, description, and image are required.' });
    return;
  }

  const currentUser = req.db.users.find((user) => user.id === req.user.id);
  const listingId = `listing-${uuidv4()}`;

  const newProduct = {
    id: listingId,
    name: String(title).trim(),
    category,
    cardPrice: Number(price),
    detailPrice: Number(price),
    description: String(description).trim(),
    imagePath: `/uploads/${req.file.filename}`,
    sellerName: currentUser.name,
    sellerEmail: currentUser.email,
    ownerId: currentUser.id,
  };

  req.db.products.unshift(newProduct);
  currentUser.listingIds.unshift(listingId);
  writeDb(req.db);

  res.status(201).json(serializeProduct(req, newProduct, currentUser));
});

app.delete('/listings/:listingId', authMiddleware, (req, res) => {
  const currentUser = req.db.users.find((user) => user.id === req.user.id);

  if (!currentUser.listingIds.includes(req.params.listingId)) {
    res.status(404).json({ message: 'Listing not found.' });
    return;
  }

  currentUser.listingIds = currentUser.listingIds.filter((id) => id !== req.params.listingId);

  req.db.products = req.db.products.filter((product) => {
    if (product.id !== req.params.listingId) {
      return true;
    }

    return product.ownerId === null;
  });

  writeDb(req.db);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Furniture Store API running on http://localhost:${PORT}`);
});
