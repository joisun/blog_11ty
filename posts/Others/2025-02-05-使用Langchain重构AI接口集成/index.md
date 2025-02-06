---
title: 使用Langchain重构AI接口集成
date: 2025-02-05
tags:
  - post
---



## 重构前引入一个新的AI api 逻辑

### 定义常量

**typings\aiModelAdaptor.ts**

```ts
export enum AgentsType {
    "XunFeiSpark" = "XunFeiSpark",
    "ChatAnywhere" = "ChatAnywhere",
    "Kimi" = "Kimi"
}
```

该常量影响了 Options 页面配置 API key 的入口选项

**entrypoints\options\components\ApiKeysConfigComponent.tsx**

```ts
import { AgentsType, AiAgentApiKeys } from '@/typings/aiModelAdaptor';
//......
function generateOptions() {
    const agents = Object.values(AgentsType);
    return agents.map((agent, index) => {
        return {
            name: agent,
            id: index
        }
    })

}
const agents: Agent[] = generateOptions()
//......
<Select onValueChange={e => setSelectedAgent(Number(e))} value={selectedAgent?.toString() || null}>
<SelectTrigger className="w-80">
    <SelectValue placeholder="Select the AI provider" />
</SelectTrigger>
<SelectContent>
    <SelectGroup>
        <SelectItem value={null} disabled>Select the AI provider</SelectItem>
        {agents.map(agent => (
            <SelectItem key={agent.id} value={agent.id.toString()} disabled={apiKeys.some(item => item.agentName === agent.name)}>
                {agent.name}
            </SelectItem>
        ))}
    </SelectGroup>
</SelectContent>
</Select>
```

也就是这里：

![image-20250206175436642](./assets/image-20250206175436642.png)

当你新增了一个枚举值后，这里就会多出一个填写选项可供选择：

```diff
  export enum AgentsType {
      "XunFeiSpark" = "XunFeiSpark",
      "ChatAnywhere" = "ChatAnywhere",
      "Kimi" = "Kimi",
+     "OpenAI" = "OpenAI"
  }
```

![image-20250206175721486](./assets/image-20250206175721486.png)

但是这只是 UI 的配置入口， 对应的代码逻辑也不可缺少。 



### 定义对应的适配器

以kimi 为例：

我们需要先创建一个对应的文件 **lib\aiModels\kimi.ts**

```ts
// lib\aiModels\kimi.ts

import { AgentsType } from "@/typings/aiModelAdaptor";
import { AiApiBasic } from ".";
import { RequestFn } from "@/typings/app";

// 定义KIMI api 的请求方法和响应处理
const kimiAPI: RequestFn = function ({ apikey, apiUrl, model, userMessage }) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apikey}`, // 替换成你的 API key
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: "Please analyze the user's provided resume information and job description to assess how well the user matches the job. Consider key job-related factors such as job title, required skill set, education, years of experience, age, and any other relevant details. Based on the analysis, write a polite and conversational job application greeting, aiming to secure an interview or job opportunity. Be sure to use professional yet friendly language."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                temperature: 0.3
            })
        };

        fetch(apiUrl, options)
            .then(response => response.json())  // 处理 JSON 响应
            .then(result => {
                if (result.choices && result.choices[0].message) {
                    resolve(result.choices[0].message.content);  // 返回结果
                } else {
                    reject("接口获取信息错误，请排查：moonshot api");
                }
            })
            .catch(error => reject(error));  // 捕获错误
    });
}

// 通过继承 AiApiBasic 类实现kimiAPIAIService 并导出
export class kimiAPIAIService extends AiApiBasic {
    constructor(modelList: string[]) {
        const apiUrl = 'https://api.moonshot.cn/v1/chat/completions'
        super(AgentsType.Kimi, apiUrl, modelList, kimiAPI)
    }
}
```

在 AiApiBasic 类中，我们做了什么？

**lib\aiModels\index.ts**

```ts
import { AgentsType } from "@/typings/aiModelAdaptor";
import { API_ERROR_TYPE, RequestFn } from "@/typings/app";
import { APIException } from "@/utils/APIException";
import { log } from "@/utils/app";

export async function chatComplete(message: string) {
  return browser.runtime.sendMessage({ type: "chatCompletion", data: message });
}

// 定义 AI 接口的统一结构
export interface AIModelInterface {
  /**API 的 名字 */
  name?: AgentsType;
  /**API 的 URL 请求地址 */
  apiUrl?: string;
  /**API 所应用的模型列表 */
  modelList: string[];
  chatCompletion(input: string): Promise<string>;
}

export class AiApiBasic implements AIModelInterface {
  name: AgentsType;
  apiUrl: string;
  modelList: string[];
  requestFn: RequestFn;
  constructor(
    name: AgentsType,
    apiUrl: string,
    modelList: string[],
    requestFn: RequestFn
  ) {
    this.modelList = modelList;
    this.name = name;
    this.apiUrl = apiUrl;
    this.requestFn = requestFn;
  }
  // AI 服务应该在自己内部尝试多轮 模型尝试,直到全部失败才抛出错误
  async chatCompletion(input: string): Promise<string> {
    const apiKey = await getAgentApiKey(this.name);
    if (!apiKey) {
      throw new Error(`AI API: ${this.name} 未设置apikey，请在setting中设置`);
    }
    for (const model of this.modelList) {
      try {
        // 依次尝试调用各个服务
        const response = await this.requestFn({
          apikey: apiKey,
          apiUrl: this.apiUrl,
          model: model,
          userMessage: input,
          // maxTokens: await greetingWordsLimit.getValue()
        });
        return Promise.resolve(response);
      } catch (error) {
        if (error instanceof APIException) {
          log(
            `${this.name} API failed for model ${model}: \n ${error.type}: ${error.message}`,
            "error"
          );
        }
        continue; // 尝试下一个model
      }
    }
    // 如果所有模型的请求都失败了,那么就会抛出错误
    throw new APIException(
      `All Model for ${this.name} services failed`,
      API_ERROR_TYPE.APIError
    );
  }
}
```



### 初始化 AI api 对象实例，并使用

我们是如何初始化并使用 api 的

**entrypoints\sidepanel\components\NewRecord.tsx**

```ts
import { AiApiAdaptor } from '@/lib/aiModels'
//......
let AI: AiApiAdaptor | null = null
async function initAiApiAdaptor() {
    AI = new AiApiAdaptor()
    await AI.initServices([
      new chatanywhereAIService(['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4']),
      new xunfeiSparkAPIAIService(['generalv3']),
      new kimiAPIAIService(['moonshot-v1-8k']),
    ])
}
//......
// ai 对象的调用
const sendToAi = async (payload: any) => {
	if (!AI) {
    	await initAiApiAdaptor()
	}
	const response = await AI?.chat(processedMsg)
}
//......
```

AiApiAdaptor 是 AI 接口的调度器， 在内部实现上， 它暴露了一个 `initServices` 的方法，并接收一个 AI 服务的实例列表，当被调用时，将会按照用户的配置顺序依次排序 AI 服务对象。 它还实现了一个  `chat` 方法， 当它被调用的时候，会依次尝试定义的 AI 服务，如果某个 AI 服务的响应异常，那么会暂时移除该服务并尝试下一个 AI 服务，以确保尽力获取 AI 响应。 

具体的实现如下：

**lib\aiModels\index.ts**

```ts

/**
 * AI 接口调度器, 自动化尝试调用各个 AI 服务, 包括所有 AI 接口提供的不同模型
 */
export class AiApiAdaptor {
  private services!: AIModelInterface[];
  private toRemoveServices: AIModelInterface[] = [];
  constructor() {}

  /**
   * Initialize the AI model services to be used in the current session. The input services
   * will be filtered by the agentApiKeys stored in the storage. The agentApiKeys will be
   * mapped to the corresponding AI model services and the services that do not have a
   * corresponding agentApiKey will be filtered out.
   * @param services The AI model services to be used in the current session.
   * @returns A promise that resolves when the services are initialized.
   */
  initServices(services: AIModelInterface[]) {
    return agentsStorage.getValue().then((agentApiKeys) => {
      this.services = agentApiKeys
        .map((agentApi) => {
          return services.find(
            (service) => service.name === agentApi.agentName
          )!;
        })
        .filter((service) => service !== undefined);
    });
  }
  /**
   * 当某个服务请求失败的时候，就在该轮循环中结束的时候，暂时移除，避免每次都重试该失败的 服务
   */
  private removeInvalidServices() {
    for (const service of this.toRemoveServices) {
      const index = this.services.indexOf(service);
      if (index !== -1) {
        this.services.splice(index, 1); // 从数组中删除元素
        log(`暂时移除无效的 API 服务 ${service.name}`, "warn");
      }
    }
  }

  async chat(input: string): Promise<string> {
    if (!this.services) {
      throw new APIException(
        "Services is not prepared! Please initialize the AiApiAdaptor first.",
        API_ERROR_TYPE.APINETEXCEPTION
      );
    }

    for (const service of this.services) {
      try {
        // 依次尝试调用各个服务
        const response = await service.chatCompletion(input);
        this.removeInvalidServices();
        return response;
      } catch (error) {
        if (error instanceof APIException) {
          log(`${error.type}: ${error.message} `, "error");
        }
        // 收集需要移除的 service
        this.toRemoveServices.push(service);
        console.log("error", error);
        continue; // 尝试下一个服务
      }
    }
    throw new APIException("All AI services failed", API_ERROR_TYPE.APIError);
  }
}
```



## 存在的问题

## 引入 Langchain 来优化逻辑

### 适配器工厂

**lib\aiModels\adapters\index.ts**



### langchainService

**lib\aiModels\langchainService.ts**

```ts
import { AgentsType } from '@/typings/aiModelAdaptor';
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { AIModelAdapterFactory } from './adapters';

export class LangchainService {
  private models: Map<AgentsType, BaseLanguageModel>;
  private promptTemplate: PromptTemplate;

  constructor() {
    this.models = new Map();
    this.promptTemplate = PromptTemplate.fromTemplate(`
      Please explain the following vocabulary word or phrase in {language} and format the response as follows:

      **Word Or Phrase**: {selection}

      **Format requirements**:
      1. First line: Show the word name, pronunciation, and part of speech, separated by a vertical bar |. Use emojis appropriately to enhance readability and fun.
      2. Second line: Provide a simple definition of the word.
      3. Provide two or three example sentences to show how the word is used in context.
    `);
  }

  async initializeModel(type: AgentsType, apiKey: string) {
    try {
      const adapter = AIModelAdapterFactory.getAdapter(type);
      const model = adapter.createModel(apiKey);
      this.models.set(type, model);
    } catch (error) {
      console.error(`Failed to initialize model ${type}:`, error);
      throw error;
    }
  }

  async explain(type: AgentsType, selection: string, language: string): Promise<string> {
    const model = this.models.get(type);
    if (!model) {
      throw new Error(`Model ${type} not initialized`);
    }

    const chain = RunnableSequence.from([
      this.promptTemplate,
      model,
      new StringOutputParser(),
    ]);

    try {
      const response = await chain.invoke({
        selection,
        language,
      });

      return response;
    } catch (error) {
      console.error(`Error in ${type} explanation:`, error);
      throw error;
    }
  }

  isModelAvailable(type: AgentsType): boolean {
    return this.models.has(type);
  }
}

// 创建单例实例
export const langchainService = new LangchainService(); 
```



### aiServiceManager

**lib\aiModels\aiServiceManager.ts**

```ts
import { AgentsType } from '@/typings/aiModelAdaptor';
import { langchainService } from './langchainService';
import { agentsStorage } from '@/utils/storage';

export class AIServiceManager {
  private static instance: AIServiceManager;
  private initialized = false;

  private constructor() {}

  static getInstance(): AIServiceManager {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const agents = await agentsStorage.getValue();
      if (!agents) return;

      for (const agent of agents) {
        await langchainService.initializeModel(
          agent.agentName,
          agent.apiKey
        );
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize AI services:', error);
      throw error;
    }
  }

  async getExplanation(selection: string, language: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    // 获取所有已配置的模型
    const agents = await agentsStorage.getValue() || [];
    
    // 按配置顺序尝试不同的模型
    for (const agent of agents) {
      if (langchainService.isModelAvailable(agent.agentName)) {
        try {
          return await langchainService.explain(agent.agentName, selection, language);
        } catch (error) {
          console.error(`Failed to get explanation from ${agent.agentName}:`, error);
          continue;
        }
      }
    }

    throw new Error('No available AI service');
  }
}

export const aiServiceManager = AIServiceManager.getInstance(); 
```

