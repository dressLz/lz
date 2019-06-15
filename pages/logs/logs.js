Page({
  data: {
    treeData: {
      text: 'My Tree',
      id: 0,
      childMenus: [
        {
          text: 'Parent 1',
          id: 1,
          childMenus: [
            {
              text: 'Child 1',
              id: 2,
              childMenus: [
                {
                  text: 'Grandchild 1',
                  id: 3,
                },
                {
                  text: 'Grandchild 2',
                  id: 4,
                },
              ]
            },
            {
              text: 'Child 2',
              id: 5,
            }
          ]
        },
        {
          text: 'Parent 2',
          id: 6,
          childMenus: [
            {
              text: 'Child 1',
              id: 7,
            },
            {
              text: 'Child 2',
              id: 8,
            }
          ]
        }
      ]
    },
  },
  //事件处理函数
  tapItem: function (e) {
    console.log('index接收到的itemid: ' + e.detail.itemid);
  },

  onLoad: function () {

  },
})