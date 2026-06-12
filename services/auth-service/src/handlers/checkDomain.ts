import { FastifyRequest, FastifyReply } from 'fastify';
import { getUniversityByEmail } from '@studymarket/utils';

export async function checkDomainHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email } = request.query as { email?: string };

  if (!email || !email.includes('@')) {
    return reply.status(400).send({ error: 'A valid email is required' });
  }

  const domain = email.toLowerCase().split('@')[1] || '';
  const university = getUniversityByEmail(email);

  if (university) {
    const shortCode = university.name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 8);

    return reply.send({
      domain: university.domain,
      institutionName: university.name,
      country: university.countryCode,
      shortCode: shortCode || university.domain.toUpperCase(),
      iconAccent: '#1C6E8F',
      verified: true,
    });
  }

  return reply.send({
    domain,
    institutionName: 'External/Generic Email Domain',
    country: 'UNKNOWN',
    shortCode: 'GENERIC',
    iconAccent: '#999999',
    verified: false,
  });
}
