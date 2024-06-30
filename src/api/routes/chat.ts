import _ from 'lodash';

import Request from '@/lib/request/Request.ts';
import Response from '@/lib/response/Response.ts';
import core from '../controllers/core.ts';
import chat from '@/api/controllers/chat.ts';
import logger from '@/lib/logger.ts';

export default {

    prefix: '/hf/v1/chat',

    post: {

        '/completions': async (request: Request) => {
            request
                .validate('body.conversation_id', v => _.isUndefined(v) || _.isString(v))
                .validate('body.messages', _.isArray)
                .validate('headers.authorization', _.isString)
            // token切分
            const tokens = core.tokenSplit(request.headers.authorization);
            // 随机挑选一个token
            const token = _.sample(tokens);
            const { model, conversation_id: convId, messages, stream } = request.body;
            if (stream) {
                const stream = await chat.createCompletionStream(model, messages, token, convId);
                return new Response(stream, {
                    type: "text/event-stream"
                });
            }
            else
                return await chat.createCompletion(model, messages, token, convId);
        }

    }

}
