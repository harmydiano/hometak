import QueryParser from '../lib/api/query-parser';


export default async (req, res) => {
	const queryParser = new QueryParser(Object.assign({}, req.query));
	const obj = req.response;
	const processor = obj.model.getProcessor();
	const response = await processor.getApiClientResponse({ ...obj, queryParser });
	return res.status(obj.code).json(response);
};
