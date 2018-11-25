$(document).ready(() => {

	if(window.__API_URL__ == "" || typeof window.__API_URL__ == "undefined"){
		alert("URL da API não configurada!");
		return false;
	}

	const URL_API = window.__API_URL__;

	const ImportacaoArquivo = {

		initiation : () => {			
			ImportacaoArquivo.TABLE.loader();
			ImportacaoArquivo.bindEvent();
		},

		TABLE : {
			drawRow : (data) =>{

				let $tr = $([
					"<tr>",
						"<td>",
							"<span class='custom-checkbox'>",
								"<input class='checkbox' type='checkbox' name='line'>",
								"<label  for='checkbox1'></label>",
							"</span>",
						"</td>",
						"<td>"+ data.nome +"</td>",
						"<td>"+ data.dataNascimentoFormated +"</td>",
					"</tr>"
				].join(""));

				$tr.data(data);

				$("#table-aluno tbody").append($tr);
			},

			loader : () => {
				$("#table-aluno tbody tr").remove();

				//desenha linha da tabela
				ImportacaoArquivo.REQUEST.fetch("GET", "aluno", "listaTodosAlunos").then((response) => {
					response.dados.forEach((item) => {
						ImportacaoArquivo.TABLE.drawRow(item);
					});
				});
			},

			bindEvent : () => {
				$(document).on("click", "#table-aluno input.checkbox", function(){
					if($(this).is(":checked")){
						$("#table-aluno input.checkbox").attr('disabled',true);
						$(this).removeAttr('disabled');
					}else{
						$("#table-aluno input.checkbox").removeAttr('disabled');
					}
				});
			}
		},

		REQUEST : {
			fetch : function ( method, service, rota, dados){
				$(".loader").show();
				return new Promise(function(resolve, reject) {
					$.ajax({
						url : URL_API+"/"+service+"/"+rota+"/",
						data : dados,
						method: method,
						success : (response) => {
							resolve(response, response.dados);
							$(".loader").hide();
						},
						error : (request, status, error) =>  {
							if(request.responseJSON.status != 200){
								alert(request.responseJSON.message);
								$(".loader").hide();
								return false;
							}
						}
					});
				});
			},

			file : function( method, service, rota, dados){
				$(".loader").show();
				return new Promise(function(resolve, reject) {
					$.ajax({
						url : URL_API+"/"+service+"/"+rota+"/",
						data: dados,
						contentType : false,
						processData : false,
						method: method,
						success : (response) => {
							resolve(response);
							$(".loader").hide();
						},
						error : (request, status, error) =>  {
							if(request.responseJSON.status != 200){
								alert(request.responseJSON.message);
								$(".loader").hide();
								return false;
							}
						}
					});	
				});	
			}
		},

		CSV : {
			convertArrayOfObjectsToCSV : function (args) {
				let result, ctr, keys, columnDelimiter, lineDelimiter, data;
				data = args.data || null;

				if (data == null || !data.length) {
				    return null;
				}

				columnDelimiter = args.columnDelimiter || ';';
				lineDelimiter = args.lineDelimiter || '\n';
				keys = Object.keys(data[0]);

				result = '';
				result += keys.join(columnDelimiter);
				result += lineDelimiter;

				data.forEach(function(item) {
				    ctr = 0;
				    keys.forEach(function(key) {
				        if (ctr > 0) result += columnDelimiter;
				        result += item[key];
				        ctr++;
				    });

				    result += lineDelimiter;

				});
				return result;
			},

			downloadCSV : function (args) {
				let data, filename, link;

				let csv = ImportacaoArquivo.CSV.convertArrayOfObjectsToCSV({
				    data: args.arrayOfObjects
				});

				if (csv == null) return;
				filename = args.filename || 'export.csv';

				if (!csv.match(/^data:text\/csv/i)) {
				    csv = 'data:text/csv;charset=utf-8,' + csv;
				}

				data = encodeURI(csv);
				link = document.createElement('a');
				link.setAttribute('href', data);
				link.setAttribute('download', filename);
				link.click();
			}
		},

		bindEvent : () => {
			// eventos da tabela
			ImportacaoArquivo.TABLE.bindEvent();


			//botão editar dentro da modal
			$("#importar").on("click", function(){
				if(!$("#table-aluno input.checkbox:checked").length){
					alert("Por favor selecione um aluno para importar as notas.");
					return false;
				}
			});

			// Botão para visualizar notas de um aluno
			$("#visualizar").on("click", function(){
				
				$("#table-notas tbody tr").remove();

				if(!$("#table-aluno input.checkbox:checked").length){
					alert("Por favor selecione um aluno para visualizar as notas.");
					return false;
				}

				//dados da linha da tabela fora da popup
				let dataRowChecked = $("#table-aluno input.checkbox:checked").parents("tr").data();

				ImportacaoArquivo.REQUEST.file(
					"GET", 
					"prova", 
					"buscaProvasAluno/"+dataRowChecked.id
				)
				.then((response) => {
					let $tr = []; 

					response.dados.forEach((item) => {
						
						$tr.push(
							"<tr>",
								"<td>"+ item.materiaDescricaoCompleta +"</td>",
								"<td>"+ item.dataFormatada +"</td>",
								"<td>"+ item.nota +"</td>",
							"</tr>"
						);
					});

					$("#table-notas tbody").append($tr.join(""));
				});
			});

			// botão que está dentro da modal editar
			$("#btn-importar").on("click", function(){
				let dataRowChecked = $("#table-aluno input.checkbox:checked").parents("tr").data();

				if(!$("#arquivo").val()){
					alert("Selecione o arquivo csv a ser importado!");
					return false;
				}

				let formData = new FormData();

				formData.append("arquivo", $('input[type=file]')[0].files[0]);
				formData.append("id", dataRowChecked.id);

				ImportacaoArquivo.REQUEST.file("POST", "prova", "importarNota", formData)
				.then((response) => {
					alert(response.message);
					$('#modal-importarArquivo').modal('toggle');
				});
			});

			// exportar CSV;
			$("#exportar").on("click", function(){
				let dataRowChecked = $("#table-aluno input.checkbox:checked").parents("tr").data();

				if(dataRowChecked && confirm("Deseja gerar um relatório com as notas de " +dataRowChecked.nome+"?")){

					ImportacaoArquivo.REQUEST.file(
						"GET", 
						"prova", 
						"buscaProvasAluno/"+dataRowChecked.id
					)
					.then((response) => {
						let dados = [];
						response.dados.forEach((item) => {

							dados.push({
								Materia : item.materiaDescricaoCompleta,
								Data : item.dataFormatada,
								Nota : item.nota
							});
						});

						let fileName = "Relatorio-" + dataRowChecked.nome.replace(" ", "")+".csv";

						ImportacaoArquivo.exportarDadosParaCSV(dados, fileName);
					});
				}
			});

		},

		exportarDadosParaCSV : (dados, _filename) => {
			ImportacaoArquivo.CSV.downloadCSV({
				arrayOfObjects : dados,
				filename : _filename
			});
		},

		clearForm : () => {
			$("#arquivo").val();
		}

	};

	ImportacaoArquivo.initiation();
});