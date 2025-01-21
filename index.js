import express from 'express';
import mongoose from 'mongoose';
import router from './routes/sportitems.js'

const app = express();
mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`);

// Middleware voor JSON-gegevens
app.use(express.json());

// Middleware voor www-urlencoded-gegevens
app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use((req, res, next) => {
    if (req.header('Accept') !== 'application/json' && req.method !== "OPTIONS") {
        res.status(406).json({error: 'Only JSON is allowed as accept header'});
    } else {
        next();
    }
})

app.get('/', (req, res) => {
    res.json({message: 'Welcome John Prok'})
})

app.use('/sportitems', router);


app.listen(process.env.EXPRESS_PORT, () => {
    console.log('Server is gestart');
});