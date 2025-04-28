const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configurar o transporte de email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Envia um email
 * @param {string} to - Email do destinatário
 * @param {string} subject - Assunto do email
 * @param {string} text - Conteúdo do email em texto
 * @param {string} html - Conteúdo do email em HTML
 * @returns {Promise} - Promessa com o resultado do envio
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email enviado: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

/**
 * Envia um email de confirmação de agendamento
 * @param {Object} agendamento - Objeto com dados do agendamento
 * @param {Object} cliente - Objeto com dados do cliente
 * @returns {Promise} - Promessa com o resultado do envio
 */
const enviarConfirmacaoAgendamento = async (agendamento, cliente) => {
  if (!cliente.email) {
    console.log('Cliente não possui email cadastrado');
    return null;
  }

  const dataHora = new Date(agendamento.dataHora);
  const dataFormatada = dataHora.toLocaleDateString('pt-BR');
  const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const subject = 'Confirmação de Agendamento - Salão de Beleza';
  const text = `
    Olá ${cliente.nome},

    Seu agendamento foi confirmado com sucesso!

    Detalhes do agendamento:
    - Serviço: ${agendamento.servico.nome}
    - Data: ${dataFormatada}
    - Hora: ${horaFormatada}
    - Profissional: ${agendamento.profissional.nome}
    - Valor: R$ ${agendamento.valorTotal.toFixed(2)}

    Agradecemos pela preferência!
    Em caso de dúvidas, entre em contato conosco.

    Atenciosamente,
    Equipe do Salão de Beleza
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #8e44ad; text-align: center;">Confirmação de Agendamento</h2>
      <p>Olá <strong>${cliente.nome}</strong>,</p>
      <p>Seu agendamento foi confirmado com sucesso!</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #8e44ad; margin-top: 0;">Detalhes do agendamento:</h3>
        <p><strong>Serviço:</strong> ${agendamento.servico.nome}</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Hora:</strong> ${horaFormatada}</p>
        <p><strong>Profissional:</strong> ${agendamento.profissional.nome}</p>
        <p><strong>Valor:</strong> R$ ${agendamento.valorTotal.toFixed(2)}</p>
      </div>
      
      <p>Agradecemos pela preferência!</p>
      <p>Em caso de dúvidas, entre em contato conosco.</p>
      
      <p style="margin-top: 30px;">Atenciosamente,<br>Equipe do Salão de Beleza</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777;">
        <small>Este é um email automático, por favor não responda.</small>
      </div>
    </div>
  `;

  return await sendEmail(cliente.email, subject, text, html);
};

/**
 * Envia um email de lembrete de agendamento
 * @param {Object} agendamento - Objeto com dados do agendamento
 * @param {Object} cliente - Objeto com dados do cliente
 * @returns {Promise} - Promessa com o resultado do envio
 */
const enviarLembreteAgendamento = async (agendamento, cliente) => {
  if (!cliente.email) {
    console.log('Cliente não possui email cadastrado');
    return null;
  }

  const dataHora = new Date(agendamento.dataHora);
  const dataFormatada = dataHora.toLocaleDateString('pt-BR');
  const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const subject = 'Lembrete de Agendamento - Salão de Beleza';
  const text = `
    Olá ${cliente.nome},

    Estamos enviando este email para lembrá-lo do seu agendamento amanhã!

    Detalhes do agendamento:
    - Serviço: ${agendamento.servico.nome}
    - Data: ${dataFormatada}
    - Hora: ${horaFormatada}
    - Profissional: ${agendamento.profissional.nome}
    - Valor: R$ ${agendamento.valorTotal.toFixed(2)}

    Caso precise reagendar, entre em contato conosco com antecedência.

    Agradecemos pela preferência!

    Atenciosamente,
    Equipe do Salão de Beleza
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #8e44ad; text-align: center;">Lembrete de Agendamento</h2>
      <p>Olá <strong>${cliente.nome}</strong>,</p>
      <p>Estamos enviando este email para lembrá-lo do seu agendamento amanhã!</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #8e44ad; margin-top: 0;">Detalhes do agendamento:</h3>
        <p><strong>Serviço:</strong> ${agendamento.servico.nome}</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Hora:</strong> ${horaFormatada}</p>
        <p><strong>Profissional:</strong> ${agendamento.profissional.nome}</p>
        <p><strong>Valor:</strong> R$ ${agendamento.valorTotal.toFixed(2)}</p>
      </div>
      
      <p>Caso precise reagendar, entre em contato conosco com antecedência.</p>
      <p>Agradecemos pela preferência!</p>
      
      <p style="margin-top: 30px;">Atenciosamente,<br>Equipe do Salão de Beleza</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777;">
        <small>Este é um email automático, por favor não responda.</small>
      </div>
    </div>
  `;

  return await sendEmail(cliente.email, subject, text, html);
};

/**
 * Envia um email para clientes inativos
 * @param {Object} cliente - Objeto com dados do cliente
 * @param {number} diasInatividade - Número de dias de inatividade
 * @returns {Promise} - Promessa com o resultado do envio
 */
const enviarEmailClienteInativo = async (cliente, diasInatividade) => {
  if (!cliente.email) {
    console.log('Cliente não possui email cadastrado');
    return null;
  }

  const subject = 'Sentimos sua falta! - Salão de Beleza';
  const text = `
    Olá ${cliente.nome},

    Sentimos sua falta! Já faz ${diasInatividade} dias desde sua última visita ao nosso salão.

    Gostaríamos de convidá-lo(a) para conhecer nossos novos serviços e promoções.
    
    Como cliente especial, oferecemos 10% de desconto no seu próximo agendamento.
    Basta mencionar este email ao agendar.

    Você pode agendar pelo nosso aplicativo ou entrando em contato conosco.

    Esperamos vê-lo(a) em breve!

    Atenciosamente,
    Equipe do Salão de Beleza
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #8e44ad; text-align: center;">Sentimos sua falta!</h2>
      <p>Olá <strong>${cliente.nome}</strong>,</p>
      <p>Sentimos sua falta! Já faz <strong>${diasInatividade} dias</strong> desde sua última visita ao nosso salão.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #8e44ad; margin-top: 0;">Oferta Especial</h3>
        <p>Gostaríamos de convidá-lo(a) para conhecer nossos novos serviços e promoções.</p>
        <p>Como cliente especial, oferecemos <strong>10% de desconto</strong> no seu próximo agendamento.</p>
        <p>Basta mencionar este email ao agendar.</p>
      </div>
      
      <p>Você pode agendar pelo nosso aplicativo ou entrando em contato conosco.</p>
      <p>Esperamos vê-lo(a) em breve!</p>
      
      <p style="margin-top: 30px;">Atenciosamente,<br>Equipe do Salão de Beleza</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777;">
        <small>Este é um email automático, por favor não responda.</small>
      </div>
    </div>
  `;

  return await sendEmail(cliente.email, subject, text, html);
};

/**
 * Envia um email de alerta de estoque baixo
 * @param {Object} produto - Objeto com dados do produto
 * @param {string} emailAdmin - Email do administrador
 * @returns {Promise} - Promessa com o resultado do envio
 */
const enviarAlertaEstoqueBaixo = async (produto, emailAdmin) => {
  const subject = 'Alerta de Estoque Baixo - Salão de Beleza';
  const text = `
    Alerta de Estoque Baixo

    O produto "${produto.nome}" está com estoque baixo.

    Detalhes do produto:
    - Nome: ${produto.nome}
    - Categoria: ${produto.categoria}
    - Quantidade atual: ${produto.quantidadeEstoque} ${produto.unidadeMedida}
    - Nível mínimo: ${produto.nivelMinimoEstoque} ${produto.unidadeMedida}

    Por favor, faça a reposição do estoque o mais breve possível.

    Este é um email automático do sistema de gerenciamento do Salão de Beleza.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #e74c3c; text-align: center;">Alerta de Estoque Baixo</h2>
      <p>O produto "<strong>${produto.nome}</strong>" está com estoque baixo.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #e74c3c; margin-top: 0;">Detalhes do produto:</h3>
        <p><strong>Nome:</strong> ${produto.nome}</p>
        <p><strong>Categoria:</strong> ${produto.categoria}</p>
        <p><strong>Quantidade atual:</strong> ${produto.quantidadeEstoque} ${produto.unidadeMedida}</p>
        <p><strong>Nível mínimo:</strong> ${produto.nivelMinimoEstoque} ${produto.unidadeMedida}</p>
      </div>
      
      <p>Por favor, faça a reposição do estoque o mais breve possível.</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777;">
        <small>Este é um email automático do sistema de gerenciamento do Salão de Beleza.</small>
      </div>
    </div>
  `;

  return await sendEmail(emailAdmin, subject, text, html);
};

/**
 * Envia um email de lembrete de limpeza ou manutenção
 * @param {Object} lembrete - Objeto com dados do lembrete
 * @param {string} emailAdmin - Email do administrador
 * @returns {Promise} - Promessa com o resultado do envio
 */
const enviarLembreteLimpezaManutencao = async (lembrete, emailAdmin) => {
  const tipoFormatado = lembrete.tipo.charAt(0).toUpperCase() + lembrete.tipo.slice(1);
  const dataFormatada = new Date(lembrete.dataProximaExecucao).toLocaleDateString('pt-BR');

  const subject = `Lembrete de ${tipoFormatado} - Salão de Beleza`;
  const text = `
    Lembrete de ${tipoFormatado}

    Título: ${lembrete.titulo}
    Descrição: ${lembrete.descricao}
    Data: ${dataFormatada}
    Prioridade: ${lembrete.prioridade}

    Este é um lembrete automático do sistema de gerenciamento do Salão de Beleza.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #8e44ad; text-align: center;">Lembrete de ${tipoFormatado}</h2>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Título:</strong> ${lembrete.titulo}</p>
        <p><strong>Descrição:</strong> ${lembrete.descricao}</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Prioridade:</strong> ${lembrete.prioridade}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777;">
        <small>Este é um lembrete automático do sistema de gerenciamento do Salão de Beleza.</small>
      </div>
    </div>
  `;

  return await sendEmail(emailAdmin, subject, text, html);
};

module.exports = {
  sendEmail,
  enviarConfirmacaoAgendamento,
  enviarLembreteAgendamento,
  enviarEmailClienteInativo,
  enviarAlertaEstoqueBaixo,
  enviarLembreteLimpezaManutencao
};
