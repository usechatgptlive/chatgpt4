import { For, Show, onMount } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { getSettingsByProviderId, getSettingsByProviderId, setSettingsByProviderId, setSettingsByProviderId } from '@/stores/settings'
import { useI18n } from '@/hooks'
import { addConversation, conversationMapSortList, currentConversationId } from '@/stores/conversation'
import Login from './Login'
import Charge from './Charge'
import type { User } from '@/types'
import type { Accessor, Setter } from 'solid-js'

interface Props {
  setIsLogin: Setter<boolean>
  isLogin: Accessor<boolean>
  setUser: Setter<User>
  user: Accessor<User>
}
export default (props: Props) => {
  const { t } = useI18n()
  const $conversationMapSortList = useStore(conversationMapSortList)

  onMount(async() => {
    try {
      // 读取token
      if (localStorage.getItem('token')) {
        props.setIsLogin(true)
        const response = await fetch('/api/info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: localStorage.getItem('token'),
          }),
        })
        const responseJson = await response.json()
        if (responseJson.code === 200) {
          localStorage.setItem('user', JSON.stringify(responseJson.data))
          props.setUser(responseJson.data)
          setTimeout(() => {
            const setting = getSettingsByProviderId('provider-openai')
            setSettingsByProviderId('provider-openai', {
              authToken: localStorage.getItem('token') as string,
              maxTokens: setting.maxTokens,
              model: setting.model,
              temperature: setting.temperature,
            })
          }, 1000)
        } else {
          props.setIsLogin(false)
        }
      } else {
        props.setIsLogin(false)
      }
    } catch (err) {
      console.error(err)
    }
  })

  return (
    <div class="flex h-full">
      <div class="flex flex-col w-full max-w-md mx-8 sm:mx-18">
        <Show when={!props.isLogin()}>
          <div class="fi mt-12">
            <span class="text-(2xl transparent) font-extrabold bg-(clip-text gradient-to-r) from-sky-400 to-emerald-600">ChatGPT 4.0</span>
          </div>
          <div mt-1 op-60>欢迎来到人工智能时代</div>
          <div op-60>验证邮箱开始使用</div>
          <Login
            setIsLogin={props.setIsLogin}
            setUser={props.setUser}
          />
        </Show>
        <Show when={props.isLogin()}>
          <Charge
            setUser={props.setUser}
            user={props.user}
          />
          <a href="https://lg8h2izm09.feishu.cn/docx/YU7UduJFNoMKSPxa94JcWkd0nJg" target="_blank" class="fi gap-2 h-8 text-sm op-60" rel="noreferrer">查看使用说明</a>
          <a href="https://lg8h2izm09.feishu.cn/docx/FhbmdO3LaoSnadxWWy7cpALSnLe" target="_blank" class="fi gap-2 h-8 text-sm op-60  text-yellow-500" rel="noreferrer">如何区分GPT3.5和GPT4.0</a>
          <p class="mt-2 text-xs text-yellow-800">提示：建议收藏永久入口: https://chat11.chatxyz.online 防止域名被墙失联。</p>
          <div class="px-6 py-4 bg-base-100 border border-base rounded-lg">
            <h2 class="text-xs op-30 uppercase my-2">{t('conversations.recent')}</h2>
            <div class="flex flex-col items-start">
              <For each={$conversationMapSortList().slice(0, 3)}>
                {instance => (
                  <div class="fi gap-2 h-8 max-w-full hv-foreground" onClick={() => currentConversationId.set(instance.id)}>
                    {instance.icon ? instance.icon : <div class="text-sm i-carbon-chat" />}
                    <div class="flex-1 text-sm truncate">{instance.name || t('conversations.untitled')}</div>
                  </div>
                )}
              </For>
              <Show when={!$conversationMapSortList().length}>
                <div class="fi gap-2 h-8 text-sm op-20">{t('conversations.noRecent')}</div>
              </Show>
            </div>
          </div>
          <div
            class="fcc mt-2 gap-2 p-6 bg-base-100 hv-base border border-base rounded-lg"
            onClick={() => addConversation()}
          >
            <div class="i-carbon-add" />
            <div class="flex-1 text-sm truncate">{t('conversations.add')}</div>
          </div>
        </Show>
      </div>
    </div>
  )
}
