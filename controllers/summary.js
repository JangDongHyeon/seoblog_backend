const axios = require('axios')
exports.add = async (req, res, next) => {
    try {
        const { mode, inputData, language } = req.body

        let result = ''
        if (language === 'ko') {
            if (mode === 'news')
                result = await axios.post('http://155.230.134.125:50999/articlesumm', { string: inputData });
            else if (mode === 'edu')
                result = await axios.post('http://155.230.134.125:50999/tedsumm', { string: inputData });
            else if (mode === 'conversation')
                result = await axios.post('http://155.230.134.125:50999/dialsumm', { string: inputData });

        }


        res.json({ summary: result.data });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            error: error
        });
    }
}