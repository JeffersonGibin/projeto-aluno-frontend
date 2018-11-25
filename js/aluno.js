$(document).ready(() => {

	if(window.__API_URL__ == "" || typeof window.__API_URL__ == "undefined"){
		alert("URL da API não configurada!");
		return false;
	}

	const URL_API = window.__API_URL__;
	const SERVICE = "/aluno";

	var Aluno = {

		initiation : () => {			
			Aluno.TABLE.loader();
			Aluno.bindEvent();
		},

		TABLE : {
			drawRow : (data) =>{

				var $tr = $([
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
				Aluno.REQUEST.fetch("GET", "listaTodosAlunos").then((response) => {
					response.dados.forEach((item) => {
						Aluno.TABLE.drawRow(item);
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
			fetch : function ( method, rota, dados){
				$(".loader").show();
				return new Promise(function(resolve, reject) {
					$.ajax({
						url : URL_API+SERVICE+"/"+rota,
						contentType: "application/json",
						data : JSON.stringify(dados),
						dataType : 'json',
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
			}
		},

		bindEvent : () => {
			// eventos da tabela
			Aluno.TABLE.bindEvent();

			$("#btn-cadastrar-aluno").on("click", function(){
				Aluno.REQUEST.fetch("POST", "cadastrarAluno", {
					nome : $("#nome").val(), 
					dataNascimento: $("#dataNascimento").val()
				})
				.then((response) => {
					alert(response.message);
					Aluno.TABLE.loader();
					 $('#modal-cadastrar-aluno').modal('toggle');
					Aluno.clearForm();
				});
			});


			//botão editar dentro da modal
			$("#editar").on("click", function(){
				if(!$("#table-aluno input.checkbox:checked").length){
					alert("Por favor selecione a linha que será editada!");
					return false;
				}
				
				let dataRowChecked = $("#table-aluno input.checkbox:checked").parents("tr").data();

				$("#nome-editar").val(dataRowChecked.nome);
				$("#dataNascimento-editar").val(dataRowChecked.dataNascimento);
			});


			//botão deletar fora da modal
			$("#deletar").on("click", function(){
				if(!$("#table-aluno input.checkbox:checked").length){
					alert("Por favor selecione a linha que será editada!");
					return false;
				}
			});

			// botão que está dentro da modal editar
			$("#btn-editar-modal").on("click", function(){
				let dataRowChecked = $("#table-aluno input.checkbox:checked").parents("tr").data();

				let rota = "editarAluno/"+dataRowChecked.id;
				Aluno.REQUEST.fetch("PUT", rota, {
					nome : $("#nome-editar").val(), 
					dataNascimento: $("#dataNascimento-editar").val(),
					media : dataRowChecked.media
				})
				.then((response) => {
					$('#modal-editar-aluno').modal('toggle');
					alert(response.message);
					Aluno.TABLE.loader();
					Aluno.clearForm();
				});
			});

			// botão que está dentro da modal deletar
			$("#btn-deletar-modal").on("click", function(){
				if(!$("#table-aluno input.checkbox:checked").length){
					alert("Por favor selecione a linha que será editada!");
					return false;
				}

				let dataRowChecked = $("#table-aluno input.checkbox:checked").parents("tr").data();
				let rota = "deletarAluno/"+dataRowChecked.id;

				Aluno.REQUEST.fetch("DELETE", rota, {})
				.then((response) => {
					$('#modal-excluir-aluno').modal('toggle');
					Aluno.TABLE.loader();
					Aluno.clearForm();
				});
			});

		},

		clearForm : () => {
			$("#nome").val("");
			$("#dataNascimento").val("");
			$("#nome-editar").val();
			$("#dataNascimento-editar").val();
		}

	};

	Aluno.initiation();
});