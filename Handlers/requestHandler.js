const mailService = require('../Services/mailService').mailService;
const { Request, User, Post } = require('../Schemas');

const findRequestsBy = async (query) => {
    try {
        const results = await Request.find(query);
        return results;
    } catch (err) {
        return -1;
    }
}


const editRequest = async (req, res) => {
    const requestDetails = {
        subject: req.body.subject,
        operation_dates: req.body.operation_dates,
        description: req.body.description
    }
    try {
        await Request.updateOne({ _id: req.params.requestId }, requestDetails);
        res.status(200).send("Updated");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const findRequester = async (id, res) => {
    try {
        const requester = await Request.findOne({ _id: id }, 'requester');
        return requester;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const sendSubmitEmail = (requester) => {
    mailService.submitRequestEmail({
        name: {
            first: requester.name.first,
            last: requester.name.last
        },
        email: requester.email
    });
}


const sendAcceptEmail = (requester) => {
    mailService.acceptRequestEmail({
        name: {
            first: requester.name.first,
            last: requester.name.last
        },
        email: requester.email
    });
}


const sendRejectEmail = async (id, res) => {
    try {
        const requester = await User.findOne({ _id: id });
        mailService.rejectRequestEmail({
            name: {
                first: requester.name.first,
                last: requester.name.last
            },
            email: requester.email
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const deleteRequester = async (id, res) => {
    try {
        const delRequester = await User.deleteOne({ _id: id });
        return;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const deleteRequest = async (id, res) => {
    try {
        const delRequest = await Request.deleteOne({ _id: id });
        return;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const addRequest = async (req, res) => {
    const newRequest = new Request({
        subject: req.body.subject,
        requester: req.body.requesterId,
        operation_dates: req.body.operation_dates,
        location: req.body.location,
        description: req.body.description,
    });
    try {
        const request = await newRequest.save();
        return request;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


module.exports = {
    editRequest,
    findRequester,
    sendRejectEmail,
    deleteRequester,
    deleteRequest,
    addRequest,
    sendSubmitEmail,
    findRequestsBy,
    sendAcceptEmail

}