import { getCurrentInstance, nextTick, onUnmounted, reactive, shallowRef, watchEffect } from 'vue'
import { isProdMode } from '@/utils/common/is'

/** 模块级响应式存储（必需用 reactive 才能被 watchEffect 追踪），key=uid */
const dataMap = reactive<Record<number, any>>({})
const openStateMap: Record<number, boolean> = {}

export function useModal() {
  const modalRef = shallowRef<any>(null)
  const loadedRef = shallowRef(false)
  const uid = shallowRef<number>(0)

  function register(instance: any, uuid: number) {
    if (isProdMode()) {
      onUnmounted(() => {
        modalRef.value = null
        loadedRef.value = false
        delete dataMap[uuid]
        delete openStateMap[uuid]
      })
    }
    if (unref(loadedRef) && isProdMode() && instance === unref(modalRef))
      return

    uid.value = uuid
    modalRef.value = instance
    loadedRef.value = true

    instance.emitOpen = (show: boolean, _uid: number) => {
      openStateMap[_uid] = show
    }
  }

  const getModal = (): any => {
    const modal = unref(modalRef)
    if (!modal)
      console.error('useModal instance is undefined!')
    return modal
  }

  const methods = {
    setModalProps: (props: Partial<any>): void => {
      getModal()?.setModalProps(props)
    },
    openModal: <T = any>(data?: T, show = true): void => {
      getModal()?.setModalProps({ show })
      if (!data)
        return
      const id = unref(uid)
      dataMap[id] = null as any
      nextTick(() => {
        dataMap[id] = data
      })
    },
    closeModal: () => {
      getModal()?.setModalProps({ show: false })
    },
  }

  return [register, methods] as const
}

export function useModalInner(callbackFn?: (data?: any) => void) {
  const modalInstanceRef = shallowRef<any>(null)
  const currentInstance = getCurrentInstance()
  const uidRef = shallowRef(0)
  let isMounted = true

  if (!currentInstance) {
    throw new Error('useModalInner() can only be used inside setup() or functional components!')
  }

  const getModalInner = () => {
    const instance = unref(modalInstanceRef)
    if (!instance)
      console.error('useModalInner instance is undefined!')
    return instance
  }

  function register(modalInnerInstance: any, uuid: number) {
    if (isProdMode()) {
      onUnmounted(() => {
        isMounted = false
        modalInstanceRef.value = null
        delete dataMap[uuid]
        delete openStateMap[uuid]
      })
    }
    uidRef.value = uuid
    modalInstanceRef.value = modalInnerInstance
    currentInstance?.emit('register', modalInnerInstance, uuid)
  }

  watchEffect(() => {
    const id = unref(uidRef)
    const data = dataMap[id]
    if (!data)
      return
    if (!callbackFn || typeof callbackFn !== 'function')
      return
    nextTick(() => {
      if (isMounted)
        callbackFn(data)
    })
  })

  const methods = {
    setModalProps: (props: Partial<any>): void => {
      getModalInner()?.setModalProps(props)
    },
    openModal() {
      getModalInner()?.setModalProps({ show: true })
    },
    closeModal: () => {
      getModalInner()?.setModalProps({ show: false })
    },
  }

  return [register, methods] as const
}
