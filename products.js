import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

let productModal = null;
let delProductModal = null;
// productModal/delProductModal 必須是在全域環境宣告，假設直接從 mounted 內宣告，會導致該變數作用域只存在 mounted 範圍內（因為 mounted 也屬於函式），而無法在 openModal 函式中順利取得該變數，導致錯誤

createApp({
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/v2',
      apiPath: 'winnie05',
      products: [],
      isNew: false,
      tempProduct: {
        imagesUrl: [],
      },
    }
  },
  mounted() {
    productModal = new bootstrap.Modal(this.$refs.productModal, {
      keyboard: false
    });

    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
      keyboard: false
    });

    // 取出 Token
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common.Authorization = token;

    this.checkAdmin();
  },
  methods: {
    // 確認使用者權限
    checkAdmin() {
      const url = `${this.apiUrl}/api/user/check`;
      axios.post(url)
        .then(() => {
          this.getProducts();
        })
        .catch((err) => {
          alert(err.response.data.message)
          window.location = 'login.html';
        })
    },
    // 取得所有產品資訊
    getProducts() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products`; // 不加 all 有分頁
      axios.get(url)
        .then((res) => {
          this.products = res.data.products;
        }).catch((err) => {
          alert(err.response.data.message);
        })
    },
    updateProduct() {
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
      let http = 'post';

      if (!this.isNew) {
        url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
        http = 'put'
      }

      axios[http](url, { data: this.tempProduct }).then((response) => {
        alert(response.data.message);
        productModal.hide();
        this.getData();
      }).catch((err) => {
        alert(err.response.data.message);
      })
    },
    openModal(isNew, product) {
      if (isNew === 'new') {
        this.tempProduct = {
          imagesUrl: [],
        };
        this.isNew = true;
        productModal.show();
      } else if (isNew === 'edit') {
        this.tempProduct = { ...product };
        this.isNew = false;
        productModal.show();
      } else if (isNew === 'delete') {
        this.tempProduct = { ...product };
        delProductModal.show()
      }
    },
    delProduct() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;

      axios.delete(url).then((response) => {
        alert(response.data.message);
        delProductModal.hide();
        this.getData();
      }).catch((err) => {
        alert(err.response.data.message);
      })
    },
    createImages() {
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push('');
    },
  },
}).mount('#app');