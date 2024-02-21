import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

let productModal = null;
let delProductModal = null;

const app = createApp({
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2",
      apiPath: "winnie05",
      //全部產品資料
      products: [],
      //產品分類
      categoryList: [],
      //按鈕動作狀態
      actionState: "",
      //產品資料
      tempProduct: {
        imagesUrl: []
      },
      //頁碼
      pagination: {},
      isNew: false,
    }
  },
  methods: {
    //開啟 model
    openModel(action, product) {
      if (action === "create") {
        this.actionState = "create"
        this.tempProduct = {
          imagesUrl: []
        }
        productModal.show()
      } else if (action === "edit") {
        this.actionState = "edit"
        this.tempProduct = { ...product }
        productModal.show()
      } else {
        this.actionState = "delete"
        this.tempProduct = { ...product }
        delProductModal.show()
      }
    },
    //取得全部商品資料
    getProducts(page = 1, category) {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products?page=${page}`;
      if (category) { url += `&category=${category}` }

      axios.get(url)
        .then(res => {
          const { products, pagination } = res.data
          this.products = products
          this.pagination = pagination          
        })
        .catch((err) => {
          alert(err.response.data.message);
          window.location = 'login.html';
        })
    },
    //取得商品分類
    getCategory() {
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/products/all`

      axios.get(url)
        .then(res => {
          const products = Object.values(res.data.products)
          const categoryList = new Set(products.map((item => item.category)))
          this.categoryList = [...categoryList]
        })
        .catch(err => console.log(err.response.data.message))
    },
    //確認登入
    checkAdmin() {
      const url = `${this.apiUrl}/api/user/check`;
      axios.post(url)
        .then(() => {
          this.getProducts();
          this.getCategory();
        })
        .catch((err) => {
          Swal.fire("請先登入");
          window.location = "index.html";
        })
    }
  },
  mounted() {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    axios.defaults.headers.common.Authorization = token;
    this.checkAdmin();
  },
})

// 新增 & 編輯 modal template
app.component("product-modal", {
  template: "#product-modal",
  props: ["actionState", "tempProduct"],
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2",
      apiPath: "winnie05",
      //資料庫對照表
      dataKey: {
        title: "標題",
        category: "分類",
        unit: "單位",
        origin_price: "原價",
        price: "售價"
      }
    }
  },
  mounted() {
    productModal = new bootstrap.Modal(document.getElementById('productModal'), {
      keyboard: false,
      backdrop: 'static'
    });
  },
  methods: {
    handleData() {
      const method = this.actionState === "create" ? "post" : "put"
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`
      if (this.actionState === "edit") {
        url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`
      }

      axios[method](url, { "data": this.tempProduct })
        .then(res => {
          this.hideModal()
          Swal.fire(res.data.message)
          this.$emit("updateData")
          this.$emit("updateCategory")
        })
        .catch(err => {
          const errMessage = err.response.data.message[0]
          const errKey = errMessage.split(" ")[0]
          Swal.fire(`${this.dataKey[errKey]}不得為空`)
        })

    },
    hideModal() {
      productModal.hide()
    },
    createImage() {
      this.tempProduct.imagesUrl.push('');
    },
    deleteImage() {
      this.tempProduct.imagesUrl.pop()
    }
  }
})

// 刪除 modal template
app.component("delete-modal", {
  template: "#delete-modal",
  props: ["tempProduct"],
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2",
      apiPath: "winnie05",
    }
  },
  mounted() {
    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
      keyboard: false,
      backdrop: 'static'
    });
  },
  methods: {
    deleteData() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`

      axios.delete(url)
        .then(res => {
          this.hideModal()
          Swal.fire("刪除成功")
          this.$emit("updateData")
          this.$emit("updateCategory")
        })
        .catch(err => console.log(err.response.data.message))
    },
    hideModal() {
      delProductModal.hide()
    }
  }
})

// 頁碼 template
app.component("pagination", {
  template: "#pagination",
  props: ["pagination"],
  methods: {
    changePage(page) {
      this.$emit("changePage", page)
    }
  },
})

app.component("filter-component", {
  template: "#filter-component",
  props: ["categoryList"],
  data() {
    return {
      page: 1,
      currentCategory: ""
    }
  },
  methods: {
    handleFilterData() {
      this.$emit("filter-data", this.page, this.currentCategory);
    }
  },
  watch: {
    currentCategory: 'handleFilterData',
  }
})

app.mount('#app');