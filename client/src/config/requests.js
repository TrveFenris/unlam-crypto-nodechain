/**
 * To add a new request method, just create a new array element.
 * The new array element should consist of:
 * ['key', 'request']
 * where the key is a common name for the request (used on Map.get('key') to get the appropiate request)
 * and the request is the Axios request object, described above
 */
const requestsArray = [
  [
    'getchain',
    {
      url: 'api/v1/chain',
      method: 'get',
    },
  ],
  [
    'newblock',
    {
      url: 'api/v1/blocks/new',
      method: 'get',
      timeout: 0,
    },
  ],
  [
    'newtransaction',
    {
      url: 'api/v1/transactions/new',
      method: 'post',
    },
  ],
  [
    'registernodes',
    {
      url: 'api/v1/nodes/register',
      method: 'post',
    },
  ],
  [
    'consensus',
    {
      url: 'api/v1/nodes/consensus',
      method: 'get',
    },
  ],
]

const requests = new Map(requestsArray)
export default requests
