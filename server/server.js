const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(
    cors(
        { origin: 'http://localhost:3000', credentials: true, methods: ["GET", "POST"]}
    )
);
app.listen(4000);

app.get('/', (req, res) => {
    res.status(500).json({message:'Error'})
    res.send('Hi')
});


const blogRouter = require('./routes/events')
app.use("/events/", blogRouter)

const userRouter = require('./routes/user')
app.use("/users/", userRouter)

const toolsRouter = require('./routes/tools')
app.use("/tools/", toolsRouter)

