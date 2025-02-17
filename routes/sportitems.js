import express from 'express';
import {faker} from "@faker-js/faker";
import {Router} from "express";

import Sportitem from "../models/Sportitem.js";
import SportItem from "../models/Sportitem.js";
import sportitem from "../models/Sportitem.js";

const router = new Router();

router.options('/', (req, res) => {
    res.header('Allow', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.status(204).send();
})

router.options('/:id', (req, res) => {
    res.header('Allow', 'GET,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,DELETE,OPTIONS');
    res.status(204).send();
})

router.get('/', async (req, res) => {
    let limit;
    let page;
    let previousPage;
    let pages;

    const latestItem = await sportitem.findOne().sort('-updatedAt');
    const lastModified = latestItem ? latestItem.updatedAt.toUTCString() : new Date().toUTCString();

    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified)) {
        return res.status(304).end();
    }

    const amountGetter = await sportitem.find();
    const keyCount = Object.keys(amountGetter).length;

    if (req.query.page && req.query.limit) {
        limit = parseInt(req.query.limit) || keyCount;
        page = parseInt(req.query.page) || 1;
        previousPage = req.query.page - 1;
    } else {
        limit = keyCount;
        page = 1;
        previousPage = 1;
    }

    const skip = (page - 1) * limit;

    if (limit !== 0) {
        pages = Math.ceil(keyCount / limit);
    } else {
        pages = 1;
    }

    const SportItem = await sportitem.find().limit(limit).skip(skip);

    res.setHeader('Last-Modified', lastModified);

    res.json({
        items: SportItem,
        _links:
            {
                self: {
                    href: `${process.env.HOST}/sportitems`,
                },
                collection: {
                    href: `${process.env.HOST}/sportitems`
                }
            },
        pagination: {
            currentPage: page,
            currentItems: limit,
            totalPages: pages,
            totalItems: keyCount,
            _links: {
                first: {
                    "page": 1,
                    "href": `${process.env.HOST}/?page=1&limit=${limit}`
                },
                last: {
                    "page": pages,
                    "href": `${process.env.HOST}/?page=${pages}&limit=${limit}`
                },
                previous: req.query.page > 1 ? {
                    page: req.query.page - 1,
                    href: `${process.env.HOST}/?page=${previousPage}&limit=${limit}`
                } : null,
                next: req.query.page < pages ? {
                    "page": page + 1,
                    "href": `${process.env.HOST}/?page=${page + 1}&limit=${limit}`
                } : null
            }
        }
    });
});

router.post('/seed', async (req, res) => {
    try {
        console.log(req.body)
        await Sportitem.deleteMany({});


        //Create new items
        for (let i = 0; i < req.body.amount; i++) {
            await Sportitem.create({
                title: faker.commerce.productName(),
                description: faker.lorem.paragraph(3),
                sport: faker.helpers.arrayElement(['Soccer', 'Basketball', 'Tennis', 'Running', 'Swimming', 'Cycling', 'Golf', 'Climbing', 'Curling', 'Skydiving']),
                imageUrl: faker.image.url()
            })
        }

        res.json({message: `Created ${req.body.amount} sportitems, groetjes: John Prok`})
    } catch (e) {
        console.log(e)
        res.json({error: e.message});
    }
})

router.post('/', async (req, res) => {
    try {
        const {title, description, sport, imageUrl} = req.body;

        if (!title || !description || !sport) {
            return res.status(400).json({
                error: 'All fields are required.',
            });
        }

        const newSportitem = await Sportitem.create({
            title,
            description,
            sport,
            imageUrl
        });

        res.status(201).json({
            message: `Created 1 sportitem, liefde van: John Prok`,
            sportitem: newSportitem,
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({error: e.message});
    }
});


router.get('/:id', async (req, res) => {

    try {
        const sportItem = await SportItem.findOne({_id: req.params.id});
        if (sportItem) {
            res.json(sportItem)
        } else {
            res.status(404).json({error: 'No sportItems found'})
        }
    } catch (e) {
        console.log(e)
        res.json({error: e.message});
    }
});

router.put('/:id', async (req, res) => {
    try {
        console.log('sportItem putted');

        const {id} = req.params;
        const editSportItem = req.body;
        const updatedSportItem = await SportItem.findByIdAndUpdate(id, editSportItem, {runValidators: true});

        res.status(201).json({message: req.body, succes: updatedSportItem});
    } catch (error) {
        res.status(400).json({error: error.message})
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const newStuff = req.body;

        const sportItem = await SportItem.findById(id);

        if (!sportItem) {
            return res.status(404).json({ error: 'Sportitem niet gevonden' });
        }

        if (newStuff.likes) {
            sportItem.likes = sportItem.likes + 1; // Verhoog likes met 1
        }

        const patchedSportItem = await sportItem.save();

        res.status(200).json({
            message: 'Sportitem gedeeltelijk bijgewerkt',
            sportItem: patchedSportItem
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        await sportitem.findByIdAndDelete(id)
        res.status(204).json({message: `JE ITEM IS GEDELETE!!!!`, succes: true})
        console.log('DELETED!!!')
    } catch (error) {
        res.status(400).json({error: error.message})
    }
});


export default router;