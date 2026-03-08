/**
 * 工厂函数：生成一个"只安装一次"的探针注册器
 * 
 * @param install 真正的 patch 函数，接收 trigger（用来触发所有 handler）
 * @returns addHandler 函数，供外部注册消费者
 */
export function createObserver(install: (trigger: (event: T) => void) => void) {
    const handlers: Array<(data: T) => void> = [];
    let installed = false;

    return function addHandler(handler: (data: T) => void) {
        handlers.push(handler);
        if (!installed) {
            installed = true;
            // trigger 是探针内部调用的函数，负责广播给所有 handler
            install((event: T) => handlers.forEach(h => h(event)));
        }
    }
}