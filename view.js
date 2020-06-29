const XLSXa = require('xlsx')

var knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: "./db.sqlite"
    }
});

function EklemeBasarili(mesaj) {
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: mesaj,
        showConfirmButton: false,
        timer: 1500
    })
};

function HataMesajiBas(mesaj) {
    Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: mesaj,
    });
};

function ExcelBas(data) {
    var createXLSLFormatObj = [];

    /* XLS Head Columns */
    var xlsHeader = [
        "#",
        "CİHAZ S/N",
        "CİHAZ TİPİ",
        "READER S/N",
        "IP NO",
        "FRAM RAPOR",
        "ARIZA DURUM",
        "ONAY DURUM",
        "BİRİM",
        "TARİH"
    ];

    /* XLS Rows Data */
    var xlsRows = data;

    createXLSLFormatObj.push(xlsHeader);
    $.each(xlsRows, function (index, value) {
        value.Id = value.siraNo;
        value.siraNo = null;
        value.yil = null;
        var innerRowData = [];
        $.each(value, function (ind, val) {
            // val.Id=val.siraNo;
            innerRowData.push(val);
        });
        createXLSLFormatObj.push(innerRowData);
    });


    /* File Name */
    var filename = "Kayıtlar.xls";

    /* Sheet Name */
    var ws_name = "Sheet 1";

    var wsCols = [
        { wch: 6 },
        { wch: 7 },
        { wch: 10 },
        { wch: 20 }
    ];

    if (typeof console !== 'undefined') console.log(new Date());
    var wb = XLSXa.utils.book_new(),
        ws = XLSXa.utils.aoa_to_sheet(createXLSLFormatObj);
    ws['!cols'] = wsCols;
    /* Add worksheet to workbook */
    XLSXa.utils.book_append_sheet(wb, ws, ws_name);

    /* Write workbook and Download */
    if (typeof console !== 'undefined') console.log(new Date());
    // XLSXa.writeFile(wb, filename);
    if (typeof console !== 'undefined') console.log(new Date());

    var dialog = require('electron').remote.dialog;
    var options = {
        title: "Excel Kayıt",
        defaultPath: "C:\\Kayıtlar.xls",
        buttonLabel: "Kaydet",
        filters: [
            { name: 'Excel 97-2003 dosyası | .xls', extensions: ['xls'] }
        ]
    }
    WIN = require('electron').remote.getCurrentWindow();
    var o = dialog.showSaveDialog(WIN, options).then(result => {
        XLSXa.writeFile(wb, result.filePath);
    });
};

function otomatikYilCevir() {
    knex.select().from('Kayit').then((rows) => {
        for (let i = 0; i < rows.length; i++) {
            var model = rows[i];
            var yil = model.tarih.split('.')[2];

            knex('Kayit')
                .where({
                    Id: model.Id
                })
                .update({
                    yil: yil
                }).then((val) => {

                });
        }
    });
};

function Ekle() {
    for (let index = 0; index < 350; index++) {
        var tarih2 = new Date()
        knex('Kayit').insert({
            seriNo: 1,
            cihazTipi: 1,
            readerSeriNo: 1,
            ipNo: 1,
            framRapor: "VAR",
            arizaDurum: 1,
            onayDurum: "HAYIR",
            birim: 1,
            tarih: tarih2.toLocaleDateString("tr-US"),
            yil: tarih2.toLocaleDateString("tr-US").split('.')[2]
        }).then((val) => {

        });
    }
};

var uygulama = angular.module("app", ['ngMaterial', 'ngMessages']);
uygulama.controller('ctrl', ['$scope', '$location', function ($scope, $location) {

    $scope.tarih = new Date();
    $scope.tarihAra = "";
    $scope.tarihler = [];
    $scope.siraNo = 1;
    $scope.birim = "Avrupa";
    $scope.birimAra = "";
    $scope.data = [];
    $scope.show = false;
    $scope.yedekData = [];
    $scope.yilAra = $scope.tarih.toLocaleDateString("tr-En").split('.')[2];
    $scope.yillar = [];
    $scope.ekranData = [];


    var veriSayisi = 50;
    var turSayisi = 1;
    window.addEventListener("scroll", function (event) {
        var scroll = this.scrollY;
        if (scroll >= (800 * turSayisi)) {
            veriSayisi += 30;
            $scope.ekranData = $scope.data.slice(0, veriSayisi);
            $scope.$apply();
            turSayisi++;
        } else if (veriSayisi > 100 && (scroll >= 0 && scroll <= 150)) {
            $scope.ekranData = $scope.data.slice(0, 50);
            $scope.$apply();
            turSayisi = 1;
        }
    });

    $scope.getir = function (tumYillar = false) {
        knex('Kayit')
            .select('*')
            .then((rows) => {
                $scope.data = rows;

                for (let i = 0; i < $scope.data.length; i++) {
                    var model = $scope.data[i];
                    var durum2 = true;
                    for (let k = 0; k <= $scope.yillar.length; k++) {
                        var yil = $scope.yillar[k];
                        if (model.yil == yil) {
                            durum2 = false;
                            break;
                        }
                    }
                    if (durum2 === true) {
                        $scope.yillar.push(model.yil);
                    }
                };


                if (!tumYillar) {
                    var geciciVeriler = [];
                    $scope.data.forEach(element => {
                        if (element.yil == $scope.yilAra) {
                            geciciVeriler.push(element);
                        };
                    });
                    $scope.data = [];
                    $scope.data = geciciVeriler;
                };

                $scope.tarihler = [];
                $scope.siraNo = 1;
                for (var i = 0; i < $scope.data.length; i++) {
                    $scope.data[i].siraNo = $scope.siraNo;
                    $scope.siraNo++;
                    var durum = true;
                    for (var k = 0; k < $scope.tarihler.length; k++) {
                        if ($scope.tarihler[k] === $scope.data[i].tarih) {
                            durum = false;
                            break;
                        }
                    }
                    if (durum === true) {
                        $scope.tarihler.push($scope.data[i].tarih);
                    }
                };
                $scope.yedekData = $scope.data;
                $scope.ekranData = $scope.data.slice(0, 50);
                $scope.$apply();
                /*
                $scope değişkenini DOM'da yeniler.
                */
            });
    };
    $scope.$watch("tarihAra", function (news, old) {
        H5_loading.show();
        if (old != "") {
            $scope.data = $scope.yedekData;
        }
        $scope.geciciVeriler = [];
        if ($scope.tarihAra == "") {
            $scope.tarihler = [];
            $scope.getir($scope.yilAra != "" ? false : true);
        }
        else {
            var query = knex('Kayit')
                .where('tarih', '=', $scope.tarihAra)
            if ($scope.yilAra != "") {
                query.andWhere('yil', '=', $scope.yilAra)
            }
            query.then((x) => {
                $scope.data = x;
                $scope.ekranData = x.slice(0, 50);
                siraNoVer($scope.data);
                $scope.$apply();
            });
        }
        H5_loading.hide(2);
    });

    $scope.$watch("birimAra", function (news, old) {
        H5_loading.show();
        if (old != "") {
            $scope.data = $scope.yedekData;
        }
        $scope.geciciVeriler = [];
        if ($scope.birimAra == "") {
            $scope.getir($scope.yilAra != "" ? false : true);
        }
        else {
            var query = knex('Kayit')
                .where('birim', '=', $scope.birimAra)
            if ($scope.yilAra != "") {
                query.andWhere('yil', '=', $scope.yilAra);
            }
            query.then((x) => {
                $scope.data = x;
                $scope.ekranData = x.slice(0, 50);
                siraNoVer($scope.data);
                $scope.$apply();
            });
        }
        H5_loading.hide();
    });

    $scope.$watch("yilAra", function (news, old) {
        H5_loading.show();
        $scope.getir();
        $scope.geciciVeriler = [];
        if ($scope.yilAra == "") {
            $scope.getir(true)
        }
        else {
            knex('Kayit')
                .where('yil', '=', $scope.yilAra)
                .then((x) => {
                    $scope.data = x;
                    $scope.ekranData = x.slice(0, 50);
                    siraNoVer($scope.data);
                    $scope.$apply();
                });
        }
        H5_loading.hide(2);
    });

    $scope.ExcelDokumAl = function () {
        var excelVeri = $scope.data;
        ExcelBas(excelVeri);
    };

    $scope.kontrol = function () {
        var split = $scope.seriNo.split("-");
        if (split.length > 1) {
            if (split[1].startsWith("00")) {
                $scope.cihazTipi = "ISTVAL3";
            } else if (split[1].startsWith("f0") || split[1].startsWith('F0')) {
                $scope.cihazTipi = "ISTVAL2";
            }
        } else if ($scope.seriNo == "" || $scope.seriNo == null || $scope.seriNo == undefined) {
            $scope.cihazTipi = "";
        }
    };

    $scope.dugmeKontrol = function (event, kolon) {
        $scope.ara(kolon);
    };

    $scope.getirSondan = function () {
        $scope.siraliData = [];
        for (var i = $scope.yedekData.length; i > ($scope.yedekData.length - 18); i--) {
            $scope.siraliData.push($scope.yedekData[i - 1]);
        };
        return $scope.siraliData;
    };

    $scope.ara = function (kolon) {
        H5_loading.show();
        switch (kolon) {
            case 'seriNo':
                var veri = $scope.araSeriNo;
                // var obj = $scope.data[i].seriNo;
                break;
            case 'cihazTipi':
                var veri = $scope.araCihazTipi;
                // var obj = $scope.data[i].cihazTipi;
                break;
            case 'imeiNo':
                var veri = $scope.araImeiNo;
                // var obj = $scope.data[i].imeiNo;
                break;
            case 'readerSeriNo':
                var veri = $scope.araReaderSeriNo;
            // var obj = $scope.data[i].readerSeriNo;
            case 'ipNo':
                var veri = $scope.araIpNo;
                // var obj = $scope.data[i].ipNo;
                break;
            case 'framRapor':
                var veri = $scope.araFramRapor;
                // var obj = $scope.data[i].framRapor;
                break;
            case 'arizaDurum':
                var veri = $scope.araArizaDurum;
                // var obj = $scope.data[i].arizaDurum;
                break;
            case 'onayDurum':
                var veri = $scope.araOnayDurum;
                // var obj = $scope.data[i].onayDurum;
                break;
        }

        var query = knex('Kayit')
            .where(kolon, 'like', '%' + veri + '%')
        if ($scope.yilAra != "") {
            query.andWhere('yil', '=', $scope.yilAra);
        };
        query.then((x) => {
            $scope.data = x;
            $scope.ekranData = x.slice(0, 50);
            siraNoVer($scope.data);
            $scope.$apply();
        });
        H5_loading.hide(2);
    };

    function siraNoVer(data) {
        var siraNo = 1;

        for (var i = 0; i < data.length; i++) {
            data[i].siraNo = siraNo;
            siraNo++;
        }
    };

    $scope.ekle = function () {
        var alanlar = [
            $scope.siraNo,
            $scope.seriNo,
            $scope.cihazTipi,
            $scope.readerSeriNo,
            $scope.ipNo,
            $scope.arizaDurum,
            $scope.birim,
            $scope.tarih
        ];
        var durum = true;
        for (var i = 0; i < alanlar.length; i++) {
            if (alanlar[i] == "" || alanlar[i] == undefined) {
                durum = false;
                break;
            };
        };
        if (durum) {
            var tarih2 = new Date($scope.tarih);
            knex('Kayit').insert({
                seriNo: $scope.seriNo,
                cihazTipi: $scope.cihazTipi,
                readerSeriNo: $scope.readerSeriNo,
                ipNo: $scope.ipNo,
                framRapor: "VAR",
                arizaDurum: $scope.arizaDurum,
                onayDurum: "HAYIR",
                birim: $scope.birim,
                tarih: tarih2.toLocaleDateString("tr-US"),
                yil: tarih2.toLocaleDateString("tr-US").split('.')[2]
            }).then((val) => {
                EklemeBasarili('Ekleme Başarılı');
                $scope.getir($scope.yilAra != "" ? false : true);
                $scope.seriNo = "";
                $scope.cihazTipi = "";
                $scope.readerSeriNo = "";
                $scope.ipNo = "";
                $scope.arizaDurum = "";
                $scope.birim = "Avrupa";
                $scope.tarih = new Date();
            });

        } else {
            HataMesajiBas("Boş Alan Bırakmayınız!")
        }
    };

    $scope.sil = function (id) {
        Swal.fire({
            title: 'Kayıt silinecek onaylıyor musunuz?',
            icon: 'warning',
            showCancelButton: true,
            focusConfirm: false,
            confirmButtonText:
                'Evet',
            cancelButtonText:
                'Vazgeç',
        }).then((result) => {
            if (result.value) {
                knex('Kayit')
                    .where('Id', id)
                    .del().then((val) => {
                        EklemeBasarili('Silme Başarılı');
                        $scope.show=!$scope.show;
                        $scope.getir($scope.yilAra != "" ? false : true);
                        $scope.$apply();
                    });
            };

        });
    };
    $scope.model = {};

    $scope.duzenle = function (id) {
        knex('Kayit').where({
            Id: id
        }).select('*').then((val) => {
            $scope.model = val[0];
            $scope.show = !$scope.show;
            var splitDate = $scope.model.tarih.split('.');
            $scope.model.tarih = new Date(splitDate[2], (splitDate[1] - 1), splitDate[0]);
            $scope.$apply();
        });
    };
    $scope.duzenleBas = function (id) {
        $scope.model.tarih = new Date($scope.model.tarih);
        knex('Kayit')
            .where({
                Id: $scope.model.Id
            })
            .update({
                seriNo: $scope.model.seriNo,
                cihazTipi: $scope.model.cihazTipi,
                readerSeriNo: $scope.model.readerSeriNo,
                ipNo: $scope.model.ipNo,
                arizaDurum: $scope.model.arizaDurum,
                tarih: $scope.model.tarih.toLocaleDateString("tr-US"),
                siraNo: $scope.model.siraNo,
                framRapor: $scope.model.framRapor,
                onayDurum: $scope.model.onayDurum,
                birim: $scope.model.birim,
                yil: $scope.model.tarih.toLocaleDateString("tr-US").split('.')[2]
            }).then((val) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Başarılı',
                    text: "Düzenleme işlemi başarılı",
                });
                $scope.getir($scope.yilAra != "" ? false : true);
                $scope.show = !$scope.show;
                $scope.$apply();
            })

    };
}]);