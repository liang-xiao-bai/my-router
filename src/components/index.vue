<template>
  <div class="g-table-wrap">
    <div>
      <slot name="header" />
    </div>
    <div>
      <el-table ref="tableRef"
                v-loading="loading"
                :data="tableList"
                :size="size"
                :border="border"
                :stripe="stripe"
                :row-key="rowKey"
                class="g-table"
                :class="{'g-table-dense':dense}"
                v-bind="combAttrs"
                v-on="$listeners"
      >
        <el-table-column v-if="showOrder" label="#" width="60" align="center">
          <template v-slot="{$index}">
            {{ $index + 1 + (page.current - 1) * page.size }}
          </template>
        </el-table-column>
        <template v-if="Array.isArray(headers)">
          <template v-for="(item,index) in headers">
            <!-- 是否使用自定义具名slot -->
            <template v-if="item.slot">
              <v-render :key="rowKey?item[rowKey]:index"
                        :data="item"
                        :v-nodes="$slots[item.slotName]"
              />
            </template>
            <el-table-column :key="rowKey?item[rowKey]:index" v-bind="item" />
          </template>
        </template>
        <slot v-else />
      </el-table>
    </div>
    <div class="footer-box">
      <div class="page-left">
        <slot name="footer-left" />
      </div>
      <el-pagination
        v-if="pageShow"
        :page-size.sync="page.size"
        :current-page.sync="page.current"
        :layout="page.layout"
        :page-sizes="page.sizes"
        :total="page.total"
        :pager-count="pagerCount"
        :disabled="loading"
        @current-change="currentChange"
        @size-change="sizeChange"
      />
    </div>
  </div>
</template>

<script>
const VRender = {
  props: ['vNodes'],
  render() {
    return this.vNodes
  }
}

export default {
  name: 'GTable',
  components: { VRender },
  provide() {
    return { gTable: this }
  },
  props: {
    // 列表数据中具有唯一性的字段名
    rowKey: String,
    headers: Array,
    // 是否显示分页
    pageShow: {
      type: Boolean,
      default: true
    },
    // 默认每页数量
    pageSize: {
      type: Number,
      default: 20
    },
    // 分页
    pageSizes: {
      type: Array,
      default: () => ([10, 15, 20, 30, 50, 100])
    },
    // 对应分页的 layout 属性
    pageLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    // 页码按钮的数量，当总页数超过该值时会折叠
    pagerCount: {
      type: Number,
      default: 7
    },
    /**
     * g-table组件调用该方法时会传入两个参数：
     *  @param {Object} page page中包含两个属性：current(当前页码) 和 size(当前每页数量)
     *  @param {any} params 对应通过load方法传入的第二个参数
     */
    fetch: Function,
    // table尺寸
    size: {
      type: String,
      default: 'small'
    },
    // 可能因某些原因导致高度计算有误，可以通过该参数补充
    diffHeight: {
      type: Number,
      default: 10 // 默认10px为basic-container组件的上内边距
    },
    border: {
      type: Boolean,
      default: true
    },
    stripe: {
      type: Boolean,
      default: true
    },
    // 是否通过js计算高度，使表格固定高度
    fixedHeight: {
      type: Boolean,
      default: true
    },
    // 组件创建是否自动获取数据（即执行`this.load(1)`）
    immediate: {
      type: Boolean,
      default: false
    },
    // 是否使用紧凑表格（减少行距、表格内边距）
    dense: {
      type: Boolean,
      default: false
    },
    // 是否在首列添加序号
    showOrder: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      tableList: [],
      page: {
        current: 1,
        size: this.pageSizes.find(item => item === this.pageSize) || this.pageSizes[1],
        sizes: this.pageSizes,
        layout: this.pageLayout,
        total: 0
      },
      // 缓存外部通过调用 load方法 传入的第二个参数
      cacheParams: {},
      isActived: true,
      unwatch: null,
      savePosition: [0, 0] // 记录滚动条位置 [y轴, x轴]
    }
  },
  computed: {
    // 便于外部直接访问table实例
    tableRef() {
      return this.$refs.tableRef
    },
    combAttrs() {
      const attrs = Object.assign({}, this.$attrs)
      if (this.fixedHeight) {
        attrs.height = '100%'
      }
      return attrs
    }
  },
  watch: {
    pageIndex(current) {
      this.page.current = current
    }
  },
  created() {
    if (this.immediate) {
      this.load()
    }
  },
  mounted() {
    if (this.fixedHeight) {
      if (this.$el.parentElement.children.length > 1) {
        console.warn('请确保g-table组件没有兄弟元素')
      }
      this.$nextTick(() => {
        this.updateTableHeight()
      })
      this.resizeWatch('beforeDestroy')
    }
  },
  activated() {
    if (this.fixedHeight) {
      if (!this.isActived) this.updateTableHeight()
      this.isActived = true
      this.$once('hook:deactivated', () => {
        this.isActived = false
      })

      this.resizeWatch('deactivated')
      this.restoreScrollPosition()
    }
  },
  methods: {
    // 监听窗口变化
    resizeWatch(unWatchHook) {
      // 如果触发了activated，则将mounted创建的watch删掉
      // 没有使用 keep-alive，则不会触发 activated
      if (this.unwatch) {
        this.unwatch() // 移除 $watch
        this.$off(this.unwatch.hookName) // 移除 $once
      }

      this.unwatch = this.$watch(() => this.$store.state.common.windowResize, () => {
        if (this.fixedHeight) {
          this.updateTableHeight()
        }
      })
      const hookName = 'hook:' + unWatchHook
      this.unwatch.hookName = hookName
      this.$once(hookName, () => {
        if (this.unwatch) {
          this.unwatch()
          this.unwatch = null
        }
      })
    },
    // 切换每页数量时返回到第一页并重新加载数据
    sizeChange() {
      this.load(1, this.cacheParams)
    },
    currentChange() {
      this.load(0, this.cacheParams)
    },
    updateTableHeight() {
      if (!this.isActived) return
      // h = basic-container的高度 - 搜索条件的高度 - 底部分页的高度 - 10px的上内边距
      const h = this.$el.parentElement.offsetHeight - this.$el.firstElementChild.offsetHeight - (this.pageShow ? 33 : 0) - this.diffHeight
      if (this.$refs.tableRef.$el) {
        this.$refs.tableRef.$el.parentElement.style.height = h + 'px'
      }
    },
    /**
     * @param {Number} pageIndex 分页索引，如果小于1则保留当前所在索引
     * @param {any} [params] 传递给fetch方法的第二个参数
     */
    load(pageIndex = 1, params) {
      switch (params) {
        // 如果未传入params则取缓存的params
        case undefined:
          params = this.cacheParams
          break
        // 如果传入null则清空缓存的params
        case null:
          this.cacheParams = undefined
          break
        default:
          this.cacheParams = params
      }

      let { current, size } = this.page
      if (pageIndex >= 1) {
        current = pageIndex
      }

      this.loading = true
      this.fetch({ current, size }, params).then(({ records, total, size }) => {
        this.tableList = records || []
        this.page.current = current
        this.page.total = total
        if (size) {
          this.page.size = size
        }
        // 列表渲染完成后触发rendered事件
        this.$nextTick(() => {
          if (this.isActived) {
            if (this.$refs.tableRef && this.$refs.tableRef.bodyWrapper) {
              this.$refs.tableRef.bodyWrapper.scrollTop = 0
            }
            if (this.fixedHeight) {
              this.updateTableHeight()
            }
          }
          this.$emit('rendered', this.tableList)
        })
      }).finally(() => {
        this.loading = false
      })
    },
    // 根据组件名获取组件对象
    getComponentRef(componentName) {
      let ref = null
      const recursion = (_ref, name) => {
        if (_ref.$options.name === name) {
          ref = _ref
          return true
        }
        return _ref.$children.find(item => recursion(item, name))
      }
      recursion(this, componentName)
      return ref
    },
    // 还原表格滚动条到上次的位置（只有启用keep-alive生效）
    restoreScrollPosition() {
      const tableBody = this.getComponentRef('ElTableBody')
      const scrollEl = tableBody.$el.parentElement

      // 延迟 等待el-table处理完滚动条再还原滚动条的位置
      setTimeout(() => {
        scrollEl.scrollTop = this.savePosition[0]
        scrollEl.scrollLeft = this.savePosition[1]
      }, 50)

      // 记录滚动条的位置
      const handler = e => {
        this.savePosition = [e.target.scrollTop, e.target.scrollLeft]
      }
      scrollEl.addEventListener('scroll', handler)
      this.$once('hook:deactivated', () => scrollEl.removeEventListener('scroll', handler))
    }
  }
}
</script>

<style lang="less" scoped>
.g-table-wrap ::v-deep {
  .footer-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-top: 1px #eee solid;
    .el-button {
      padding: 5px 10px;
      font-size: 12px;
    }
  }
  .caret-wrapper {
    height: 100%;
    .sort-caret.ascending {
      top: -11px;
    }
    .sort-caret.descending {
      bottom: -11px;
    }
  }
}
</style>
