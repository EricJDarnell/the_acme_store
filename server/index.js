const{
    client,
    createTables,
    createProduct,
    createUser,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    destroyFavorite
} = require('./db');
 const express = require('express');
 const app = express();
 app.use(express.json());
 app.use(require('morgan')('dev'));

 app.get('/api/users', async (req, res, next) => {
    try {
        res.send(await fetchUsers());
    } catch (ex) {
        next(ex)
    }
 });
 app.get('/api/products', async (req, res, next) => {
    try {
        res.send(await fetchProducts());
    } catch (ex) {
        next(ex);
    }
 });
 app.get('/api/users/:id/favorites', async (req, res, next) => {
    try {
        res.send(await fetchFavorites({ user_id: req.params.id }));        
    } catch (ex) {
        next(ex)
    }
 });
 app.post('/api/users/:id/favorites', async (req, res, next) => {
    try {
        res.send(await createFavorite({ product_id: req.body.product_id, user_id: req.params.id }));
    } catch (ex) {
        next(ex);
    }
 });
 app.delete('/api/users/:id/favorites/:favorite_id', async (req, res, next) => {
    try {
        await destroyFavorite({ user_id: req.params.id, id: req.params.favorite_id});
        res.sendStatus(204);
    } catch (ex) {
        next(ex);
    }
 });

 const init = async () => {
    console.log('connecting to db...');
    await client.connect();
    console.log('connected to database');
    await createTables();
    const[ coffee, knife, chair, milk, car, bin ] = await Promise.all([
        await createProduct({ name: 'coffee' }),
        await createProduct({ name: 'knife' }),
        await createProduct({ name: 'chair' }),
        await createProduct({ name: 'milk' }),
        await createProduct({ name: 'car' }),
        await createProduct({ name: 'bin' })
    ]);
    const[ daleCooper, john, poo, cinder, reed, peter ] = await Promise.all([
        await createUser({ username: 'AgentDaleCooper', password: '123FireWalkWithMe' }),
        await createUser({ username: 'SuperEyepatchWolf', password: 'TheFinalGamerHasAPlan'}),
        await createUser({ username: 'GrandPooBear', password: 'PooStomp42069' }),
        await createUser({ username: 'Artorious', password: 'sifMaster' }),
        await createUser({ username: 'MrFantastic', password: 'MindGem2025' }),
        await createUser({ username: 'AmazingSpider-Man', password: 'blackCatPajamas' })
    ]);
    console.log('fetchUsers: ', await fetchUsers());
    console.log('fetchProducts: ', await fetchProducts());
    const[ daleFav, johnFav, pooFav, cinderFav, reedFav, peterFav ] = await Promise.all([
        await createFavorite({ user_id: daleCooper.id, product_id: coffee.id }),
        await createFavorite({ user_id: john.id, product_id: knife.id }),
        await createFavorite({ user_id: poo.id, product_id: chair.id }),
        await createFavorite({ user_id: cinder.id, product_id: knife.id }),
        await createFavorite({ user_id: reed.id, product_id: bin.id }),
        await createFavorite({ user_id: peter.id, product_id: milk.id })
    ]);
    console.log('fetchFavorites: ', await fetchFavorites({ user_id: daleCooper.id }));
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
 };
 init();